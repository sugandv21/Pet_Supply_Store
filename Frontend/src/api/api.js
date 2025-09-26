// src/api.js
import axios from "axios";

/**
 * Normalize base:
 * - Prefer VITE_API_BASE if set
 * - Otherwise use empty string (relative paths) so production deploys that serve backend
 *   from same origin keep working without env vars.
 * - Remove trailing slashes.
 */
const rawBase = import.meta.env.VITE_API_BASE ?? "";
const API_BASE = rawBase.replace(/\/+$/, ""); // may be ""

// axios instance: when API_BASE === "" axios will use relative paths (same origin)
const api = axios.create({
  baseURL: API_BASE || "",
  withCredentials: false, // set true if you rely on cookies/sessions
  headers: { "Content-Type": "application/json" },
});

// --- token helpers (keys: "access" and "refresh") ---
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
if (initAccess) api.defaults.headers.common["Authorization"] = `Bearer ${initAccess}`;

// attach access token to every request if present
api.interceptors.request.use((config) => {
  const access = getAccess();
  if (access) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

// queue for refresh
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
 * Try several sensible refresh endpoints:
 * - If API_BASE already contains "/api", try `${API_BASE}/token/refresh/`
 * - Otherwise try `${API_BASE}/api/token/refresh/` and `${API_BASE}/token/refresh/`
 */
async function requestRefresh() {
  const refreshToken = getRefresh();
  if (!refreshToken) throw new Error("No refresh token available");

  const candidates = [];
  // API_BASE normalized (may be empty)
  if (API_BASE) {
    candidates.push(`${API_BASE}/token/refresh/`);
    candidates.push(`${API_BASE}/api/token/refresh/`);
  } else {
    // relative attempts
    candidates.push(`/token/refresh/`);
    candidates.push(`/api/token/refresh/`);
  }

  let lastErr = null;
  for (const url of candidates) {
    try {
      const resp = await axios.post(url, { refresh: refreshToken });
      return resp.data; // expects { access: "...", refresh?: "..." }
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

    // If no response or status not 401 -> reject
    if (!error.response) return Promise.reject(error);
    if (error.response.status !== 401) return Promise.reject(error);

    // Avoid retry loop
    if (originalRequest._retry) return Promise.reject(error);
    originalRequest._retry = true;

    // Queue if already refreshing
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
      const data = await requestRefresh(); // { access, refresh? }
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
