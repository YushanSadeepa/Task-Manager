import { TaskListParams } from "@/types/task";

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (params: TaskListParams) => [...taskKeys.lists(), params] as const,
  detail: (id: string) => [...taskKeys.all, "detail", id] as const,
  stats: () => [...taskKeys.all, "stats"] as const,
};
