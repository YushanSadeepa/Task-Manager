import { ArrowDownUp, Search } from "lucide-react";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/constants";
import { TaskListParams } from "@/types/task";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/styles";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  params: TaskListParams;
  onChange: (partial: Record<string, string | undefined>) => void;
  onClear: () => void;
}

export function TaskFilters({ search, onSearch, params, onChange, onClear }: Props) {
  return (
    <div role="search" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden />
        <input
          type="search"
          aria-label="Search tasks by title"
          placeholder="Search by title…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className={`${inputClass} pl-9`}
        />
      </div>

      <select aria-label="Filter by status" className={inputClass} value={params.status ?? ""} onChange={(e) => onChange({ status: e.target.value || undefined })}>
        <option value="">All statuses</option>
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <select aria-label="Filter by priority" className={inputClass} value={params.priority ?? ""} onChange={(e) => onChange({ priority: e.target.value || undefined })}>
        <option value="">All priorities</option>
        {PRIORITY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <div className="flex gap-2">
        <select aria-label="Sort by" className={inputClass} value={params.sortBy} onChange={(e) => onChange({ sortBy: e.target.value })}>
          <option value="createdAt">Created date</option>
          <option value="dueDate">Due date</option>
        </select>
        <Button
          variant="secondary"
          aria-label={`Sort order: ${params.order === "asc" ? "ascending" : "descending"}. Click to toggle`}
          onClick={() => onChange({ order: params.order === "asc" ? "desc" : "asc" })}
        >
          <ArrowDownUp className="h-4 w-4" />
          {params.order === "asc" ? "Asc" : "Desc"}
        </Button>
      </div>

      <Button variant="ghost" onClick={onClear}>Clear</Button>
    </div>
  );
}
