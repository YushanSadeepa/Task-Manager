"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, CircleDashed, ListChecks, Timer } from "lucide-react";
import { useTaskStats } from "@/hooks/useTasks";
import { PRIORITY_BAR, PRIORITY_OPTIONS, STATUS_BAR, STATUS_OPTIONS } from "@/lib/constants";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/States";
import { StatCard } from "./StatCard";
import { Distribution } from "./Distribution";

export function Dashboard() {
  const { data, isPending, isError, error, refetch } = useTaskStats();

  if (isPending) return <Spinner label="Loading dashboard…" />;
  if (isError) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <div className="space-y-8">
      <section aria-label="Summary" className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total tasks" value={data.total} icon={ListChecks} tone="text-indigo-600" />
        <StatCard label="Pending" value={data.byStatus.TODO} icon={CircleDashed} tone="text-slate-500" />
        <StatCard label="In progress" value={data.byStatus.IN_PROGRESS} icon={Timer} tone="text-blue-600" />
        <StatCard label="Completed" value={data.byStatus.COMPLETED} icon={CheckCircle2} tone="text-emerald-600" />
        <StatCard label="Overdue" value={data.overdue} icon={AlertCircle} tone="text-red-600" />
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Distribution
          title="Tasks by status"
          total={data.total}
          items={STATUS_OPTIONS.map((o) => ({ label: o.label, value: data.byStatus[o.value], bar: STATUS_BAR[o.value] }))}
        />
        <Distribution
          title="Tasks by priority"
          total={data.total}
          items={PRIORITY_OPTIONS.map((o) => ({
            label: o.label,
            value: data.byPriority[o.value],
            bar: PRIORITY_BAR[o.value],
          }))}
        />
      </div>

      <Link href="/tasks" className="inline-block text-sm font-medium text-indigo-600 hover:underline">
        View all tasks →
      </Link>
    </div>
  );
}
