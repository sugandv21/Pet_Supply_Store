// src/api.js
import axios from "axios";

// --- API base detection ---
// Support runtime config, VITE_API_BASE (preferred), and VITE_API_URL (fallback)
const runtimeApi =
  typeof window !== "undefined" && window.__RUNTIME_CONFIG__?.API_BASE
    ? window.__RUNTIME_CONFIG__.API_BASE
    : null;

const envApiBase = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || null;

// Final API base (trim trailing slashes, fallback to localhost in dev)
const API_BASE = (runtimeApi || envApiBase || "http://localhost:8000/api").replace(/\/+$/, "");

// --- Axios instance ---
const api = axios.create({
  baseURL: API_BASE,
  // optional: timeout: 15000,
});

// --- Token helpers (use keys: "access" and "refresh") ---
const getAccess = () => localStorage.getItem("access");
const getRefresh = () => localStorage.getItem("refresh");
const setAccess = (tok) => (tok ? localStorage.setItem("access", tok) : null);
const setRefresh = (tok) => (tok ? localStorage.setItem("refresh", tok) : null);
const clearTokens = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
  try {
    window.dispatchEvent(new Event("authChanged"));
  } catch (_) {}
};

// --- Initialize Authorization header if access token exists ---
const initAccess = getAccess();
if (initAccess) {
  api.defaults.headers.common["Authorization"] = `Bearer ${initAccess}`;
}

// --- Request interceptor: attach access token ---
api.interceptors.request.use(
  (config) => {
    const access = getAccess();
    if (access) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// --- Response interceptor: refresh tokens on 401 ---
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

    if (!error.response) return Promise.reject(error);
    if (error.response.status !== 401) return Promise.reject(error);

    if (originalRequest._retry) return Promise.reject(error);
    originalRequest._retry = true;

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
      const data = await requestRefresh(); // expected: { access, refresh? }
      const newAccess = data.access;
      const newRefresh = data.refresh;

      if (!newAccess) throw new Error("Refresh response did not include an access token");

      setAccess(newAccess);
      if (newRefresh) setRefresh(newRefresh);

      api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
      processQueue(null, newAccess);

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
