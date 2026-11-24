import { z } from "zod";
import {
  createTaskSchema,
  listTasksQuerySchema,
  taskResponseSchema,
  taskStatsSchema,
  updateStatusSchema,
  updateTaskSchema,
} from "../schemas/task.schema";

// DTOs are inferred from the schemas so the contract has a single source of truth.
export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusDto = z.infer<typeof updateStatusSchema>;
export type ListTasksQueryDto = z.infer<typeof listTasksQuerySchema>;
export type TaskResponseDto = z.infer<typeof taskResponseSchema>;
export type TaskStatsDto = z.infer<typeof taskStatsSchema>;
