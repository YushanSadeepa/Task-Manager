import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { createQueryClient } from "@/lib/queryClient";
import { taskKeys } from "@/lib/queryKeys";
import { taskService } from "@/services/taskService";

export const dynamic = "force-dynamic"; // always reflects live data

export default async function HomePage() {
  // Server-side prefetch: first paint already contains the stats. Failures are ignored here
  // and surface through the client component's error state instead.
  const queryClient = createQueryClient();
  await queryClient.prefetchQuery({ queryKey: taskKeys.stats(), queryFn: taskService.stats });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Dashboard />
      </HydrationBoundary>
    </div>
  );
}
