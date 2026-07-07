import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MapView from "../components/MapView";
import StatusBadge from "../components/StatusBadge";
import { listReports } from "../api/reports";
import { STATUS_META } from "../constants";

export default function HomePage() {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    listReports(statusFilter ? { status: statusFilter } : {})
      .then(setReports)
      .catch(() => setError("Couldn't load reports. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="flex h-[calc(100vh-73px)] flex-col md:flex-row">
      <aside className="order-2 flex w-full flex-col overflow-y-auto border-t border-asphalt-700 bg-asphalt-950 text-concrete-100 md:order-1 md:h-full md:w-80 md:border-t-0 md:border-r">
        <div className="p-5">
          <h1 className="font-display text-2xl font-semibold">Reported Potholes</h1>
          <p className="mt-1 text-sm text-concrete-200/70">
            Spotted one? <Link to="/report" className="text-hazard-400 underline">Report it</Link> so it gets fixed.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("")}
              className={`rounded-full px-3 py-1 text-xs font-semibold font-display uppercase ${
                statusFilter === "" ? "bg-hazard-400 text-asphalt-950" : "bg-asphalt-800 text-concrete-100"
              }`}
            >
              All
            </button>
            {Object.entries(STATUS_META).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold font-display uppercase ${
                  statusFilter === key ? "text-asphalt-950" : "bg-asphalt-800 text-concrete-100"
                }`}
                style={statusFilter === key ? { backgroundColor: meta.color } : {}}
              >
                {meta.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="px-5 text-sm text-status-reported">{error}</p>}
        {loading && <p className="px-5 text-sm text-concrete-200/70">Loading…</p>}

        {!loading && reports.length === 0 && !error && (
          <p className="px-5 text-sm text-concrete-200/70">
            No reports yet in this filter. Be the first to flag a pothole.
          </p>
        )}

        <ul className="divide-y divide-asphalt-700">
          {reports.map((r) => (
            <li key={r.id}>
              <Link to={`/reports/${r.id}`} className="flex gap-3 p-4 hover:bg-asphalt-900">
                <img
                  src={`/uploads/${r.photo_url}`}
                  alt="Pothole"
                  className="h-16 w-16 flex-shrink-0 rounded-md object-cover"
                />
                <div className="min-w-0">
                  <StatusBadge status={r.status} />
                  <p className="mt-1 truncate text-sm text-concrete-100">
                    {r.description || "No description provided"}
                  </p>
                  <p className="text-xs text-concrete-200/60">{r.upvote_count} confirmation(s)</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <div className="order-1 h-1/2 md:order-2 md:h-full md:flex-1">
        <MapView reports={reports} />
      </div>
    </div>
  );
}
