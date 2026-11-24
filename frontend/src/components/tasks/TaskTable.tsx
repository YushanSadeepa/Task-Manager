import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { PRIORITY_OPTIONS, PRIORITY_TONE } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import { Task, TaskStatus } from "@/types/task";
import { Badge } from "@/components/ui/Badge";
import { StatusSelect } from "./StatusSelect";

interface Props {
  tasks: Task[];
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";

export function TaskTable({ tasks, onEdit, onDelete, onStatusChange }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <caption className="sr-only">List of tasks</caption>
        <thead className="bg-slate-50 dark:bg-slate-900/60">
          <tr>
            <th scope="col" className={th}>Title</th>
            <th scope="col" className={th}>Status</th>
            <th scope="col" className={cn(th, "hidden sm:table-cell")}>Priority</th>
            <th scope="col" className={th}>Due</th>
            <th scope="col" className={cn(th, "hidden lg:table-cell")}>Created</th>
            <th scope="col" className={cn(th, "text-right")}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
              <td className="max-w-[16rem] px-4 py-3">
                <Link href={`/tasks/${t.id}`} className="font-medium text-slate-900 hover:text-indigo-600 dark:text-slate-100">
                  <span className="line-clamp-1">{t.title}</span>
                </Link>
              </td>
              <td className="px-4 py-3">
                <StatusSelect value={t.status} label={`Status for ${t.title}`} onChange={(s) => onStatusChange(t.id, s)} />
              </td>
              <td className="hidden px-4 py-3 sm:table-cell">
                <Badge className={PRIORITY_TONE[t.priority]}>
                  {PRIORITY_OPTIONS.find((p) => p.value === t.priority)?.label}
                </Badge>
              </td>
              <td className={cn("whitespace-nowrap px-4 py-3 text-sm", t.isOverdue ? "font-medium text-red-600" : "text-slate-600 dark:text-slate-300")}>
                {formatDate(t.dueDate)}
                {t.isOverdue && <span className="ml-1 text-xs">(overdue)</span>}
              </td>
              <td className="hidden whitespace-nowrap px-4 py-3 text-sm text-slate-500 lg:table-cell">{formatDate(t.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <button onClick={() => onEdit(t)} aria-label={`Edit ${t.title}`} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => onDelete(t)} aria-label={`Delete ${t.title}`} className="rounded-md p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
