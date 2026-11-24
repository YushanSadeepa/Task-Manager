import { request } from "@/lib/apiClient";
import { Task, TaskInput, TaskListParams, TaskListResult, TaskStats, TaskStatus } from "@/types/task";

const toQuery = (params: TaskListParams) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  });
  const s = qs.toString();
  return s ? `?${s}` : "";
};

export const taskService = {
  async list(params: TaskListParams): Promise<TaskListResult> {
    const { data, meta } = await request<Task[]>(`/tasks${toQuery(params)}`);
    return { items: data, meta: meta! };
  },
  async stats(): Promise<TaskStats> {
    return (await request<TaskStats>("/tasks/stats")).data;
  },
  async get(id: string): Promise<Task> {
    return (await request<Task>(`/tasks/${id}`)).data;
  },
  async create(input: TaskInput): Promise<Task> {
    return (await request<Task>("/tasks", { method: "POST", body: JSON.stringify(input) })).data;
  },
  async update(id: string, input: Partial<TaskInput>): Promise<Task> {
    return (await request<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(input) })).data;
  },
  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    return (await request<Task>(`/tasks/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) })).data;
  },
  async remove(id: string): Promise<void> {
    await request<void>(`/tasks/${id}`, { method: "DELETE" });
  },
};
