import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { TasksView } from "@/components/tasks/TasksView";
import { Spinner } from "@/components/ui/Spinner";
import { createQueryClient } from "@/lib/queryClient";
import { taskKeys } from "@/lib/queryKeys";
import { parseTaskParams } from "@/lib/taskParams";
import { taskService } from "@/services/taskService";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function TasksPage({ searchParams }: { searchParams: SearchParams }) {
  const params = parseTaskParams((k) => {
    const v = searchParams[k];
    return typeof v === "string" ? v : null;
  });

  const queryClient = createQueryClient();
  await queryClient.prefetchQuery({ queryKey: taskKeys.list(params), queryFn: () => taskService.list(params) });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* useSearchParams requires a Suspense boundary */}
      <Suspense fallback={<Spinner label="Loading tasks…" />}>
        <TasksView />
      </Suspense>
    </HydrationBoundary>
  );
}
