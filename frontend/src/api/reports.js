import client from "./client";

export async function listReports(filters = {}) {
  const { data } = await client.get("/reports", { params: filters });
  return data;
}

export async function getReport(id) {
  const { data } = await client.get(`/reports/${id}`);
  return data;
}

export async function getNearbyReports(lat, lng) {
  const { data } = await client.get("/reports/nearby", {
    params: { lat, lng },
  });
  return data;
}

export async function createReport({ photo, latitude, longitude, description, forceDuplicate }) {
  const form = new FormData();
  form.append("photo", photo);
  form.append("latitude", latitude);
  form.append("longitude", longitude);
  if (description) form.append("description", description);
  if (forceDuplicate) form.append("force_duplicate", "true");

  try {
    const { data } = await client.post("/reports", form);
    return { ok: true, report: data };
  } catch (err) {
    if (err.response?.status === 409) {
      return { ok: false, duplicate: err.response.data };
    }
    throw err;
  }
}

export async function upvoteReport(id) {
  const { data } = await client.post(`/reports/${id}/upvote`);
  return data;
}

export async function updateReportStatus(id, { status, severity, afterPhoto }) {
  const form = new FormData();
  if (status) form.append("status", status);
  if (severity) form.append("severity", severity);
  if (afterPhoto) form.append("after_photo", afterPhoto);

  const { data } = await client.patch(`/reports/${id}/status`, form);
  return data;
}

export async function getStats() {
  const { data } = await client.get("/reports/stats");
  return data;
}
