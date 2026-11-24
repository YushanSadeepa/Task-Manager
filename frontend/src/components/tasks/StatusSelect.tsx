import { STATUS_OPTIONS } from "@/lib/constants";
import { TaskStatus } from "@/types/task";

export function StatusSelect({
  value,
  onChange,
  label,
}: {
  value: TaskStatus;
  onChange: (s: TaskStatus) => void;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as TaskStatus)}
      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900"
    >
      {STATUS_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
