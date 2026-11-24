"use client";

import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { Task, TaskInput } from "@/types/task";
import { Modal } from "@/components/ui/Modal";
import { TaskForm } from "./TaskForm";

export function TaskFormModal({ open, task, onClose }: { open: boolean; task?: Task; onClose: () => void }) {
  const create = useCreateTask();
  const update = useUpdateTask();

  const handleSubmit = async (input: TaskInput) => {
    if (task) await update.mutateAsync({ id: task.id, input });
    else await create.mutateAsync(input);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={task ? "Edit task" : "New task"}>
      <TaskForm task={task} onSubmit={handleSubmit} onCancel={onClose} />
    </Modal>
  );
}
