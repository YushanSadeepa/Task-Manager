"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useTasks, useUpdateTaskStatus } from "@/hooks/useTasks";
import { PAGE_SIZE, PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/constants";
import { Task, TaskListParams, TaskPriority, TaskStatus } from "@/types/task";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { DeleteTaskModal } from "./DeleteTaskModal";
import { Pagination } from "./Pagination";
import { TaskFilters } from "./TaskFilters";
import { TaskFormModal } from "./TaskFormModal";
import { TaskTable } from "./TaskTable";

const pick = <T extends string>(value: string | null, allowed: readonly T[]): T | undefined =>
  allowed.includes(value as T) ? (value as T) : undefined;

export function TasksView() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // Filter state lives in the URL: shareable, survives refresh, back button works.
  const params: TaskListParams = {
    search: sp.get("search") ?? "",
    status: pick<TaskStatus>(sp.get("status"), STATUS_OPTIONS.map((o) => o.value)),
    priority: pick<TaskPriority>(sp.get("priority"), PRIORITY_OPTIONS.map((o) => o.value)),
    sortBy: pick(sp.get("sortBy"), ["createdAt", "dueDate"] as const) ?? "createdAt",
    order: pick(sp.get("order"), ["asc", "desc"] as const) ?? "desc",
    page: Math.max(1, Number(sp.get("page")) || 1),
    limit: PAGE_SIZE,
  };

  const setParams = useCallback(
    (partial: Record<string, string | undefined>) => {
      const next = new URLSearchParams(sp.toString());
      Object.entries(partial).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      if (!("page" in partial)) next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [sp, router, pathname],
  );

  const [searchInput, setSearchInput] = useState(params.search ?? "");
  const debouncedSearch = useDebounce(searchInput, 400);
  useEffect(() => {
    if (debouncedSearch !== (params.search ?? "")) setParams({ search: debouncedSearch || undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data, isPending, isError, error, refetch, isFetching } = useTasks(params);
  const statusMutation = useUpdateTaskStatus();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>();
  const [deleting, setDeleting] = useState<Task | null>(null);

  // If the last item on a page is deleted, step back a page.
  useEffect(() => {
    if (data && data.items.length === 0 && (params.page ?? 1) > 1) setParams({ page: String((params.page ?? 1) - 1) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const hasFilters = !!(params.search || params.status || params.priority);
  const openCreate = () => { setEditing(undefined); setFormOpen(true); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Tasks</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> New task</Button>
      </div>

      <TaskFilters
        search={searchInput}
        onSearch={setSearchInput}
        params={params}
        onChange={setParams}
        onClear={() => { setSearchInput(""); router.replace(pathname); }}
      />

      {isPending ? (
        <Spinner label="Loading tasks…" />
      ) : isError ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : data.items.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No tasks match your filters" : "No tasks yet"}
          description={hasFilters ? "Try changing or clearing your filters." : "Create your first task to get started."}
          action={!hasFilters && <Button onClick={openCreate}>Create task</Button>}
        />
      ) : (
        <div className={isFetching ? "opacity-70 transition-opacity" : "transition-opacity"} aria-busy={isFetching}>
          <TaskTable
            tasks={data.items}
            onEdit={(t) => { setEditing(t); setFormOpen(true); }}
            onDelete={setDeleting}
            onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
          />
          <Pagination meta={data.meta} onPage={(p) => setParams({ page: String(p) })} />
        </div>
      )}

      <TaskFormModal open={formOpen} task={editing} onClose={() => setFormOpen(false)} />
      <DeleteTaskModal task={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}
