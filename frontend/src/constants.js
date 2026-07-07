export const STATUS_META = {
  reported: { label: "Reported", color: "#d8483b" },
  verified: { label: "Verified", color: "#3b82c4" },
  in_progress: { label: "In Progress", color: "#f2c230" },
  fixed: { label: "Fixed", color: "#3c9d63" },
};

export const SEVERITY_META = {
  unknown: { label: "Unknown" },
  small: { label: "Small" },
  medium: { label: "Medium" },
  large: { label: "Large" },
};

export const STATUS_ORDER = ["reported", "verified", "in_progress", "fixed"];

// Backend runs on :5000 in dev; Vite proxies /api and /uploads there (see vite.config.js),
// so plain relative paths work both in dev and once built behind the same host in prod.
export const API_BASE = "/api";
export const UPLOADS_BASE = "";
