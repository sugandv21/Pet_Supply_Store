// src/api.js
import axios from "axios";

/**
 * API base handling:
 * - If VITE_API_BASE is provided at build time, use that (no trailing slash).
 * - Otherwise use empty string so axios uses relative paths (same origin).
 */
const rawBase = (import.meta.env.VITE_API_BASE ?? "").replace(/\/+$/, "");
const API_BASE = rawBase || ""; // empty => relative paths ("/api/..." will go to same origin)

// Create axios instance. When baseURL === "" axios will issue relative requests.
const api = axios.create({
  baseURL: API_BASE || "",
  withCredentials: false, // set true if you use cookie-based auth
  headers: { "Content-Type": "application/json" },
});

// Debug: print final baseURL in browser console (helps verify Vercel env)
if (typeof window !== "undefined") {
  console.debug("[api] baseURL =", api.defaults.baseURL || "(empty - using same origin)");
}

// ---------------- token helpers ----------------
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

// initialize default Authorization header if access token exists
const initAccess = getAccess();
if (initAccess) api.defaults.headers.common["Authorization"] = `Bearer ${initAccess}`;

// attach access token to every outgoing request when present
api.interceptors.request.use((config) => {
  const access = getAccess();
  if (access) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// ---------------- refresh queue logic ----------------
let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

/**
 * Attempt to refresh using several sane endpoints:
 * - If API_BASE provided, try `${API_BASE}/token/refresh/` then `${API_BASE}/api/token/refresh/`
 * - Otherwise try relative `/token/refresh/` then `/api/token/refresh/`
 */
async function requestRefresh() {
  const refreshToken = getRefresh();
  if (!refreshToken) throw new Error("No refresh token available");

  const candidates = API_BASE
    ? [`${API_BASE}/token/refresh/`, `${API_BASE}/api/token/refresh/`]
    : ["/token/refresh/", "/api/token/refresh/"];

  let lastErr = null;
  for (const url of candidates) {
    try {
      // use axios (not api) to avoid interceptor recursion
      const resp = await axios.post(url, { refresh: refreshToken });
      return resp.data; // expected { access: "...", refresh?: "..." }
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Refresh failed");
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If no response or not a 401 -> forward error
    if (!error.response) return Promise.reject(error);
    if (error.response.status !== 401) return Promise.reject(error);

    // Prevent infinite retry loops
    if (originalRequest._retry) return Promise.reject(error);
    originalRequest._retry = true;

    // If a refresh is already in progress, queue this request
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
      const data = await requestRefresh(); // { access, refresh? }
      const newAccess = data.access;
      const newRefresh = data.refresh;

      if (!newAccess) throw new Error("Refresh response did not include an access token");

      // persist tokens
      setAccess(newAccess);
      if (newRefresh) setRefresh(newRefresh);

      // update default header and process queued requests
      api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
      processQueue(null, newAccess);

      // retry original request with new token
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      // refresh failed -> clear tokens to force login
      clearTokens();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
