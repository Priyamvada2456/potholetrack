import { useEffect, useState } from "react";
import { getStats } from "../api/reports";

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-lg border border-asphalt-700/20 bg-white p-6 text-center">
      <p className="font-display text-4xl font-bold" style={{ color: accent }}>
        {value}
      </p>
      <p className="mt-2 text-sm uppercase tracking-wide text-asphalt-700">{label}</p>
    </div>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  if (!stats) {
    return <div className="px-5 py-10 text-center text-asphalt-700">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <h1 className="font-display text-3xl font-semibold text-asphalt-950">Community Impact</h1>
      <p className="mt-1 text-asphalt-700">How PotholeTrack reports turn into fixed roads.</p>
      <div className="lane-divider my-6 w-24" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Reports" value={stats.total_reports} accent="#16161a" />
        <StatCard label="Fixed" value={`${stats.percent_fixed}%`} accent="#3c9d63" />
        <StatCard
          label="Avg. Days to Fix"
          value={stats.average_fix_time_days ?? "—"}
          accent="#f2c230"
        />
      </div>
    </div>
  );
}
