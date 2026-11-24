"use client";

import { DragEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useTasks, useUpdateTaskStatus } from "@/hooks/useTasks";
import { PRIORITY_OPTIONS, PRIORITY_TONE, STATUS_OPTIONS } from "@/lib/constants";
import { BOARD_PARAMS } from "@/lib/taskParams";
import { cn, formatDate } from "@/lib/utils";
import { Task, TaskStatus } from "@/types/task";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/States";
import { StatusSelect } from "@/components/tasks/StatusSelect";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";

export function KanbanBoard() {
  const { data, isPending, isError, error, refetch } = useTasks(BOARD_PARAMS);
  const move = useUpdateTaskStatus(); // optimistic: the card jumps columns immediately, rolls back on failure
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const columns = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = { TODO: [], IN_PROGRESS: [], COMPLETED: [] };
    data?.items.forEach((t) => grouped[t.status].push(t));
    return grouped;
  }, [data]);

  if (isPending) return <Spinner label="Loading board…" />;
  if (isError) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  const handleDrop = (e: DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setOverColumn(null);
    const id = e.dataTransfer.getData("text/plain");
    const task = data.items.find((t) => t.id === id);
    if (task && task.status !== status) move.mutate({ id, status });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Board</h1>
          <p className="text-sm text-slate-500">Drag cards between columns, or use the status menu on a card.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> New task
        </Button>
      </div>

      {move.isError && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          Couldn&apos;t move the task: {move.error.message}. The change was reverted.
        </div>
      )}
      {data.meta.total > data.items.length && (
        <p className="text-sm text-amber-600">
          Showing the {data.items.length} most recent of {data.meta.total} tasks. Use the Tasks page to see all.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {STATUS_OPTIONS.map((col) => (
          <section
            key={col.value}
            aria-label={`${col.label} column`}
            onDragOver={(e) => {
              e.preventDefault();
              setOverColumn(col.value);
            }}
            onDragLeave={() => setOverColumn((c) => (c === col.value ? null : c))}
            onDrop={(e) => handleDrop(e, col.value)}
            className={cn(
              "min-h-[12rem] rounded-xl border bg-slate-100/60 p-3 transition-colors dark:bg-slate-900/50",
              overColumn === col.value
                ? "border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/30"
                : "border-slate-200 dark:border-slate-800",
            )}
          >
            <h2 className="mb-3 flex items-center justify-between px-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {col.label}
              <span className="rounded-full bg-white px-2 py-0.5 text-xs dark:bg-slate-800">{columns[col.value].length}</span>
            </h2>

            <ul className="space-y-2">
              {columns[col.value].map((t) => (
                <li
                  key={t.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", t.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing dark:border-slate-800 dark:bg-slate-900"
                >
                  <Link href={`/tasks/${t.id}`} className="font-medium text-slate-900 hover:text-indigo-600 dark:text-slate-100">
                    {t.title}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge className={PRIORITY_TONE[t.priority]}>
                      {PRIORITY_OPTIONS.find((p) => p.value === t.priority)?.label}
                    </Badge>
                    <span className={cn("text-xs", t.isOverdue ? "font-medium text-red-600" : "text-slate-500")}>
                      {t.dueDate ? `Due ${formatDate(t.dueDate)}` : "No due date"}
                      {t.isOverdue && " · overdue"}
                    </span>
                  </div>
                  {/* Keyboard / touch alternative to dragging */}
                  <div className="mt-3">
                    <StatusSelect
                      value={t.status}
                      label={`Move ${t.title} to another column`}
                      onChange={(status) => move.mutate({ id: t.id, status })}
                    />
                  </div>
                </li>
              ))}
            </ul>

            {columns[col.value].length === 0 && (
              <p className="px-1 py-6 text-center text-sm text-slate-400">No tasks here</p>
            )}
          </section>
        ))}
      </div>

      <TaskFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
