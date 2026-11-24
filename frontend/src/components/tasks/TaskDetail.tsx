"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useTask, useUpdateTaskStatus } from "@/hooks/useTasks";
import { PRIORITY_OPTIONS, PRIORITY_TONE, STATUS_OPTIONS, STATUS_TONE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { ApiError } from "@/lib/apiClient";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/States";
import { DeleteTaskModal } from "./DeleteTaskModal";
import { StatusSelect } from "./StatusSelect";
import { TaskFormModal } from "./TaskFormModal";

export function TaskDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: task, isPending, isError, error, refetch } = useTask(id);
  const statusMutation = useUpdateTaskStatus();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (isPending) return <Spinner label="Loading task…" />;
  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;
    return <ErrorState message={notFound ? "This task doesn't exist or was deleted." : error.message} onRetry={notFound ? undefined : () => refetch()} />;
  }

  const rows: [string, React.ReactNode][] = [
    ["Status", <Badge key="s" className={STATUS_TONE[task.status]}>{STATUS_OPTIONS.find((o) => o.value === task.status)?.label}</Badge>],
    ["Priority", <Badge key="p" className={PRIORITY_TONE[task.priority]}>{PRIORITY_OPTIONS.find((o) => o.value === task.priority)?.label}</Badge>],
    ["Due date", <span key="d" className={task.isOverdue ? "font-medium text-red-600" : ""}>{formatDate(task.dueDate)}{task.isOverdue && " (overdue)"}</span>],
    ["Created", formatDate(task.createdAt)],
    ["Last updated", formatDate(task.updatedAt)],
  ];

  return (
    <div className="space-y-6">
      <Link href="/tasks" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to tasks
      </Link>

      <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{task.title}</h1>
          <div className="flex items-center gap-2">
            <StatusSelect value={task.status} label="Change status" onChange={(status) => statusMutation.mutate({ id: task.id, status })} />
            <Button variant="secondary" onClick={() => setEditOpen(true)}><Pencil className="h-4 w-4" /> Edit</Button>
            <Button variant="danger" onClick={() => setDeleting(true)}><Trash2 className="h-4 w-4" /> Delete</Button>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-slate-600 dark:text-slate-300">
          {task.description || <span className="italic text-slate-400">No description provided.</span>}
        </p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
              <dd className="mt-1 text-sm text-slate-800 dark:text-slate-200">{value}</dd>
            </div>
          ))}
        </dl>
      </article>

      <TaskFormModal open={editOpen} task={task} onClose={() => setEditOpen(false)} />
      <DeleteTaskModal
        task={deleting ? task : null}
        onClose={() => setDeleting(false)}
        onDeleted={() => router.push("/tasks")}
      />
    </div>
  );
}
