// // src/api.js
// import axios from "axios";

// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

// const api = axios.create({
//   baseURL: API_BASE,
// });

// // Attach access token
// api.interceptors.request.use((config) => {
//   const access = localStorage.getItem("access_token");
//   if (access) {
//     config.headers.Authorization = `Bearer ${access}`;
//   }
//   return config;
// });

// // Response interceptor to handle token refresh
// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) prom.reject(error);
//     else prom.resolve(token);
//   });
//   failedQueue = [];
// };

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // If error response indicates token invalid / expired
//     if (error.response && error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       const refreshToken = localStorage.getItem("refresh_token");
//       if (!refreshToken) {
//         // no refresh token: redirect to login or reject
//         return Promise.reject(error);
//       }

//       if (isRefreshing) {
//         // queue requests while refreshing
//         return new Promise(function (resolve, reject) {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             originalRequest.headers.Authorization = "Bearer " + token;
//             return api(originalRequest);
//           })
//           .catch((err) => Promise.reject(err));
//       }

//       isRefreshing = true;

//       try {
//         const res = await axios.post(`${API_BASE}/token/refresh/`, { refresh: refreshToken });
//         const newAccess = res.data.access;
//         localStorage.setItem("access_token", newAccess);
//         api.defaults.headers.common["Authorization"] = "Bearer " + newAccess;
//         processQueue(null, newAccess);
//         return api(originalRequest);
//       } catch (err) {
//         processQueue(err, null);
//         // refresh failed -> clear tokens & redirect to login if desired
//         localStorage.removeItem("access_token");
//         localStorage.removeItem("refresh_token");
//         localStorage.removeItem("user");
//         return Promise.reject(err);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;

// src/api.js
import axios from "axios";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:8000/api").replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE, // example: "https://api.example.com/api"
});

// --- token helpers (use keys: "access" and "refresh") ---
const getAccess = () => localStorage.getItem("access");
const getRefresh = () => localStorage.getItem("refresh");
const setAccess = (tok) => tok && localStorage.setItem("access", tok);
const setRefresh = (tok) => tok && localStorage.setItem("refresh", tok);
const clearTokens = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
  try { window.dispatchEvent(new Event("authChanged")); } catch (_) {}
};

// set initial Authorization header if access exists
const initAccess = getAccess();
if (initAccess) {
  api.defaults.headers.common["Authorization"] = `Bearer ${initAccess}`;
}

// attach access token to every request if present
api.interceptors.request.use((config) => {
  const access = getAccess();
  if (access) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// Response interceptor to handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

async function requestRefresh() {
  const refreshToken = getRefresh();
  if (!refreshToken) throw new Error("No refresh token available");

  // POST to the refresh endpoint; using axios (not `api`) to avoid interceptor recursion
  const url = `${API_BASE}/token/refresh/`; // expecting { refresh: "<token>" } -> returns { access: "...", refresh?: "..." }
  const resp = await axios.post(url, { refresh: refreshToken });
  return resp.data;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response or not 401 -> reject
    if (!error.response) return Promise.reject(error);
    if (error.response.status !== 401) return Promise.reject(error);

    // Avoid retry loop
    if (originalRequest._retry) return Promise.reject(error);
    originalRequest._retry = true;

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = "Bearer " + token;
            resolve(api(originalRequest));
          },
          reject: (err) => reject(err),
        });
      });
    }

    isRefreshing = true;

    try {
      const data = await requestRefresh(); // { access: "...", refresh?: "..." }
      const newAccess = data.access;
      const newRefresh = data.refresh;

      if (!newAccess) throw new Error("Refresh response did not include an access token");

      // persist tokens
      setAccess(newAccess);
      if (newRefresh) setRefresh(newRefresh);

      // update default header and retry queued requests
      api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
      processQueue(null, newAccess);

      // retry original request with new access
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      // refresh failed -> clear tokens (forces login)
      clearTokens();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
