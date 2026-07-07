import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import MapView from "../components/MapView";
import StatusBadge from "../components/StatusBadge";
import { getReport, upvoteReport } from "../api/reports";

export default function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [upvoting, setUpvoting] = useState(false);

  useEffect(() => {
    getReport(id)
      .then(setReport)
      .catch(() => setError("Report not found."));
  }, [id]);

  async function handleUpvote() {
    setUpvoting(true);
    try {
      const updated = await upvoteReport(id);
      setReport(updated);
    } finally {
      setUpvoting(false);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-10 text-center">
        <p className="text-status-reported">{error}</p>
        <Link to="/" className="mt-3 inline-block text-asphalt-950 underline">
          Back to map
        </Link>
      </div>
    );
  }

  if (!report) {
    return <div className="px-5 py-10 text-center text-asphalt-700">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <Link to="/" className="text-sm text-asphalt-700 hover:underline">
        ← Back to map
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <StatusBadge status={report.status} />
        <span className="text-xs text-asphalt-700/60">
          Reported {new Date(report.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <img
            src={`/uploads/${report.photo_url}`}
            alt="Pothole"
            className="w-full rounded-lg object-cover"
          />
          {report.after_photo_url && (
            <div className="mt-3">
              <p className="mb-1 font-display text-xs font-semibold uppercase tracking-wide text-status-fixed">
                After repair
              </p>
              <img
                src={`/uploads/${report.after_photo_url}`}
                alt="After repair"
                className="w-full rounded-lg object-cover"
              />
            </div>
          )}
        </div>

        <div className="h-64 overflow-hidden rounded-lg border border-asphalt-700/20 md:h-full">
          <MapView reports={[report]} center={[report.latitude, report.longitude]} zoom={16} />
        </div>
      </div>

      <p className="mt-6 text-asphalt-800">
        {report.description || "No description was provided for this report."}
      </p>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleUpvote}
          disabled={upvoting}
          className="rounded-md border border-asphalt-950 px-4 py-2 text-sm font-semibold text-asphalt-950 hover:bg-asphalt-950 hover:text-concrete-100 disabled:opacity-50"
        >
          Still there — confirm it ({report.upvote_count})
        </button>
      </div>
    </div>
  );
}
