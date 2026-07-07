import { useEffect, useState } from "react";
import MapView from "../components/MapView";
import StatusBadge from "../components/StatusBadge";
import { listReports, updateReportStatus } from "../api/reports";
import { STATUS_META, SEVERITY_META, STATUS_ORDER } from "../constants";

export default function AdminDashboardPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("table"); // "table" | "map"
  const [statusFilter, setStatusFilter] = useState("");
  const [savingId, setSavingId] = useState(null);

  function refresh() {
    setLoading(true);
    listReports(statusFilter ? { status: statusFilter } : {})
      .then(setReports)
      .finally(() => setLoading(false));
  }

  useEffect(refresh, [statusFilter]);

  async function handleStatusChange(id, status) {
    setSavingId(id);
    try {
      const updated = await updateReportStatus(id, { status });
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } finally {
      setSavingId(null);
    }
  }

  async function handleSeverityChange(id, severity) {
    setSavingId(id);
    try {
      const updated = await updateReportStatus(id, { severity });
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } finally {
      setSavingId(null);
    }
  }

  async function handleAfterPhoto(id, file) {
    if (!file) return;
    setSavingId(id);
    try {
      const updated = await updateReportStatus(id, { afterPhoto: file });
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-asphalt-950">Admin Dashboard</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setView("table")}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
              view === "table" ? "bg-asphalt-950 text-concrete-100" : "border border-asphalt-700/30"
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setView("map")}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
              view === "map" ? "bg-asphalt-950 text-concrete-100" : "border border-asphalt-700/30"
            }`}
          >
            Map
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("")}
          className={`rounded-full px-3 py-1 text-xs font-semibold font-display uppercase ${
            statusFilter === "" ? "bg-hazard-400 text-asphalt-950" : "bg-asphalt-800/10 text-asphalt-800"
          }`}
        >
          All
        </button>
        {STATUS_ORDER.map((key) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className="rounded-full px-3 py-1 text-xs font-semibold font-display uppercase text-asphalt-950"
            style={{
              backgroundColor: statusFilter === key ? STATUS_META[key].color : `${STATUS_META[key].color}22`,
            }}
          >
            {STATUS_META[key].label}
          </button>
        ))}
      </div>

      {loading && <p className="mt-6 text-asphalt-700">Loading…</p>}

      {!loading && view === "map" && (
        <div className="mt-6 h-[70vh] overflow-hidden rounded-lg border border-asphalt-700/20">
          <MapView
            reports={reports}
            renderPopup={(r) => (
              <div className="w-48 space-y-2">
                <StatusBadge status={r.status} />
                <p className="text-xs">{r.description || "No description"}</p>
                <select
                  value={r.status}
                  onChange={(e) => handleStatusChange(r.id, e.target.value)}
                  className="w-full rounded border p-1 text-xs"
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_META[s].label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />
        </div>
      )}

      {!loading && view === "table" && (
        <div className="mt-6 overflow-x-auto rounded-lg border border-asphalt-700/20">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-asphalt-950 text-concrete-100">
              <tr>
                <th className="p-3 font-display font-semibold uppercase tracking-wide">Photo</th>
                <th className="p-3 font-display font-semibold uppercase tracking-wide">Description</th>
                <th className="p-3 font-display font-semibold uppercase tracking-wide">Status</th>
                <th className="p-3 font-display font-semibold uppercase tracking-wide">Severity</th>
                <th className="p-3 font-display font-semibold uppercase tracking-wide">Upvotes</th>
                <th className="p-3 font-display font-semibold uppercase tracking-wide">After Photo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-asphalt-700/10">
              {reports.map((r) => (
                <tr key={r.id} className={savingId === r.id ? "opacity-50" : ""}>
                  <td className="p-3">
                    <img src={`/uploads/${r.photo_url}`} alt="" className="h-14 w-14 rounded object-cover" />
                  </td>
                  <td className="max-w-xs truncate p-3">{r.description || "—"}</td>
                  <td className="p-3">
                    <select
                      value={r.status}
                      disabled={savingId === r.id}
                      onChange={(e) => handleStatusChange(r.id, e.target.value)}
                      className="rounded border border-asphalt-700/30 p-1.5 text-xs"
                    >
                      {STATUS_ORDER.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_META[s].label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      value={r.severity}
                      disabled={savingId === r.id}
                      onChange={(e) => handleSeverityChange(r.id, e.target.value)}
                      className="rounded border border-asphalt-700/30 p-1.5 text-xs"
                    >
                      {Object.entries(SEVERITY_META).map(([key, meta]) => (
                        <option key={key} value={key}>
                          {meta.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">{r.upvote_count}</td>
                  <td className="p-3">
                    {r.after_photo_url ? (
                      <img src={`/uploads/${r.after_photo_url}`} alt="" className="h-14 w-14 rounded object-cover" />
                    ) : (
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={(e) => handleAfterPhoto(r.id, e.target.files?.[0])}
                        className="w-32 text-xs"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reports.length === 0 && (
            <p className="p-6 text-center text-asphalt-700">No reports match this filter.</p>
          )}
        </div>
      )}
    </div>
  );
}
