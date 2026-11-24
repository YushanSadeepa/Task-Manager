"use client";

import { useDeleteTask } from "@/hooks/useTasks";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function DeleteTaskModal({
  task,
  onClose,
  onDeleted,
}: {
  task: Task | null;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const del = useDeleteTask();

  const confirm = async () => {
    if (!task) return;
    await del.mutateAsync(task.id).then(() => {
      onClose();
      onDeleted?.();
    }).catch(() => {});
  };

  return (
    <Modal open={!!task} onClose={onClose} title="Delete task">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Are you sure you want to delete <strong>{task?.title}</strong>? This cannot be undone.
      </p>
      {del.isError && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {del.error.message}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={del.isPending}>
          Cancel
        </Button>
        <Button variant="danger" onClick={confirm} loading={del.isPending}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
