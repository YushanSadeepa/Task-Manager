import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { TaskDetail } from "@/components/tasks/TaskDetail";
import { createQueryClient } from "@/lib/queryClient";
import { taskKeys } from "@/lib/queryKeys";
import { taskService } from "@/services/taskService";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  const queryClient = createQueryClient();
  await queryClient.prefetchQuery({ queryKey: taskKeys.detail(params.id), queryFn: () => taskService.get(params.id) });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TaskDetail id={params.id} />
    </HydrationBoundary>
  );
}
