// src/utils/joinUrl.js

// Ensure a single slash between base and path
export function joinUrl(base, path) {
  if (!base) return path;
  if (!path) return base;

  // Remove trailing slashes from base
  const b = base.replace(/\/+$/, "");
  // Ensure path starts with exactly one slash
  const p = path.startsWith("/") ? path : `/${path}`;

  return b + p;
}
