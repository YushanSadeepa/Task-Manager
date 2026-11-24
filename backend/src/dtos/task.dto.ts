import { z } from "zod";
import {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  listTasksQuerySchema,
} from "../validations/task.validation";

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusDto = z.infer<typeof updateStatusSchema>;
export type ListTasksQueryDto = z.infer<typeof listTasksQuerySchema>;

export interface TaskResponseDto {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string | null;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStatsDto {
  total: number;
  overdue: number;
  byStatus: Record<"TODO" | "IN_PROGRESS" | "COMPLETED", number>;
  byPriority: Record<"LOW" | "MEDIUM" | "HIGH", number>;
}
