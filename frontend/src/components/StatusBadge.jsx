import { STATUS_META } from "../constants";

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, color: "#999" };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold font-display uppercase tracking-wide"
      style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </span>
  );
}
