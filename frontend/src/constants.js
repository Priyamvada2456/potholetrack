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

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "";

export const API_BASE = `${BACKEND_URL}/api`;
export const UPLOADS_BASE = BACKEND_URL;

export function uploadUrl(filename) {
  return `${UPLOADS_BASE}/uploads/${filename}`;
}
