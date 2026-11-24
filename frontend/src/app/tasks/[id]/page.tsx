import { TaskDetail } from "@/components/tasks/TaskDetail";

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  return <TaskDetail id={params.id} />;
}
