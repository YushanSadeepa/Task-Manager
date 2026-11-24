import { Suspense } from "react";
import { TasksView } from "@/components/tasks/TasksView";
import { Spinner } from "@/components/ui/Spinner";

export default function TasksPage() {
  // useSearchParams requires a Suspense boundary.
  return (
    <Suspense fallback={<Spinner label="Loading tasks…" />}>
      <TasksView />
    </Suspense>
  );
}
