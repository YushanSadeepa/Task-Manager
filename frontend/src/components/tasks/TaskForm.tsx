"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@/lib/apiClient";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/constants";
import { toDateInputValue } from "@/lib/utils";
import { TaskFormValues, taskFormSchema, toTaskInput } from "@/schemas/taskSchema";
import { Task, TaskInput } from "@/types/task";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { inputClass } from "@/components/ui/styles";

const FIELDS = ["title", "description", "status", "priority", "dueDate"] as const;

interface Props {
  task?: Task;
  onSubmit: (input: TaskInput) => Promise<void>;
  onCancel: () => void;
}

export function TaskForm({ task, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "TODO",
      priority: task?.priority ?? "MEDIUM",
      dueDate: toDateInputValue(task?.dueDate),
    },
  });

  // handleSubmit awaits the async callback, so isSubmitting blocks duplicate submissions.
  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(toTaskInput(values));
    } catch (err) {
      if (err instanceof ApiError) {
        let mapped = false;
        err.details?.forEach((d) => {
          if ((FIELDS as readonly string[]).includes(d.field)) {
            setError(d.field as (typeof FIELDS)[number], { type: "server", message: d.message });
            mapped = true;
          }
        });
        if (!mapped) setError("root.server", { type: "server", message: err.message });
      } else {
        setError("root.server", { type: "server", message: "Something went wrong. Please try again." });
      }
    }
  });

  const described = (name: string, hasError: boolean) => (hasError ? `${name}-error` : undefined);

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {errors.root?.server && (
        <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {errors.root.server.message}
        </div>
      )}

      <FormField id="title" label="Title *" error={errors.title?.message}>
        <input
          id="title"
          className={inputClass}
          aria-invalid={!!errors.title}
          aria-describedby={described("title", !!errors.title)}
          {...register("title")}
        />
      </FormField>

      <FormField id="description" label="Description" error={errors.description?.message}>
        <textarea
          id="description"
          rows={3}
          className={inputClass}
          aria-invalid={!!errors.description}
          aria-describedby={described("description", !!errors.description)}
          {...register("description")}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="status" label="Status" error={errors.status?.message}>
          <select id="status" className={inputClass} {...register("status")}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="priority" label="Priority" error={errors.priority?.message}>
          <select id="priority" className={inputClass} {...register("priority")}>
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField id="dueDate" label="Due date" error={errors.dueDate?.message}>
        <input
          id="dueDate"
          type="date"
          className={inputClass}
          aria-invalid={!!errors.dueDate}
          aria-describedby={described("dueDate", !!errors.dueDate)}
          {...register("dueDate")}
        />
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {task ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}
