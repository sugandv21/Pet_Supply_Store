// src/api.js
import axios from "axios";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:8000/api").replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE,
  // optional: timeout: 15000,
});

// token helpers (use keys: "access" and "refresh")
const getAccess = () => localStorage.getItem("access");
const getRefresh = () => localStorage.getItem("refresh");
const setAccess = (tok) => tok ? localStorage.setItem("access", tok) : null;
const setRefresh = (tok) => tok ? localStorage.setItem("refresh", tok) : null;
const clearTokens = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
  try { window.dispatchEvent(new Event("authChanged")); } catch (_) {}
};

// init Authorization header
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
}, (err) => Promise.reject(err));

// Response interceptor + refresh-queue
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

  const url = `${API_BASE}/token/refresh/`;
  // use plain axios (no interceptors) to avoid recursion
  const resp = await axios.post(url, { refresh: refreshToken });
  return resp.data;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // No response or not 401 -> reject
    if (!error.response) return Promise.reject(error);
    if (error.response.status !== 401) return Promise.reject(error);

    // protect against infinite loop
    if (originalRequest._retry) return Promise.reject(error);
    originalRequest._retry = true;

    // If another refresh is in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = "Bearer " + token;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const data = await requestRefresh(); // expected: { access: "...", refresh?: "..." }
      const newAccess = data.access;
      const newRefresh = data.refresh;

      if (!newAccess) throw new Error("Refresh response did not include an access token");

      // persist tokens
      setAccess(newAccess);
      if (newRefresh) setRefresh(newRefresh);

      // update defaults and resolve queue
      api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
      processQueue(null, newAccess);

      // retry original request
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      clearTokens();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
