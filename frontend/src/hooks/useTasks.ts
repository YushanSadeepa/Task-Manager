import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/services/taskService";
import { TaskInput, TaskListParams, TaskListResult, TaskStatus } from "@/types/task";

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (params: TaskListParams) => [...taskKeys.lists(), params] as const,
  detail: (id: string) => [...taskKeys.all, "detail", id] as const,
  stats: () => [...taskKeys.all, "stats"] as const,
};

export const useTasks = (params: TaskListParams) =>
  useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => taskService.list(params),
    placeholderData: keepPreviousData, // avoids flicker while paging/filtering
  });

export const useTaskStats = () => useQuery({ queryKey: taskKeys.stats(), queryFn: taskService.stats });

export const useTask = (id: string) => useQuery({ queryKey: taskKeys.detail(id), queryFn: () => taskService.get(id) });

export const useCreateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskInput) => taskService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
};

export const useUpdateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TaskInput> }) => taskService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
};

// Optimistic status update: UI changes instantly, rolls back if the request fails.
export const useUpdateTaskStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => taskService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: taskKeys.all });
      const previous = qc.getQueriesData<TaskListResult>({ queryKey: taskKeys.lists() });
      qc.setQueriesData<TaskListResult>({ queryKey: taskKeys.lists() }, (old) =>
        old ? { ...old, items: old.items.map((t) => (t.id === id ? { ...t, status } : t)) } : old,
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => ctx?.previous.forEach(([key, data]) => qc.setQueryData(key, data)),
    onSettled: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
};
