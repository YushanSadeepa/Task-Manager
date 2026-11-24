import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { createQueryClient } from "@/lib/queryClient";
import { taskKeys } from "@/lib/queryKeys";
import { BOARD_PARAMS } from "@/lib/taskParams";
import { taskService } from "@/services/taskService";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const queryClient = createQueryClient();
  await queryClient.prefetchQuery({
    queryKey: taskKeys.list(BOARD_PARAMS),
    queryFn: () => taskService.list(BOARD_PARAMS),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <KanbanBoard />
    </HydrationBoundary>
  );
}
