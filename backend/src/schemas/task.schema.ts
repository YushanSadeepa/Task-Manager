import { z } from "zod";
import { descriptionRule, dueDateRule, titleRule, uuidRule } from "../validations/common.validation";

export const TaskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]);
export const TaskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

// ---------- Request schemas ----------
// POST /tasks and PUT /tasks/:id (full replacement)
export const createTaskSchema = z.object({
  title: titleRule,
  description: descriptionRule.optional().nullable(),
  status: TaskStatusEnum.default("TODO"),
  priority: TaskPriorityEnum.default("MEDIUM"),
  dueDate: dueDateRule.optional().nullable(),
});
export const replaceTaskSchema = createTaskSchema;

// PATCH /tasks/:id (partial update)
export const updateTaskSchema = z
  .object({
    title: titleRule.optional(),
    description: descriptionRule.optional().nullable(),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    dueDate: dueDateRule.optional().nullable(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field must be provided" });

// PATCH /tasks/:id/status
export const updateStatusSchema = z.object({ status: TaskStatusEnum });

export const idParamSchema = z.object({ id: uuidRule("task id") });

export const listTasksQuerySchema = z.object({
  search: z.string().trim().max(150).optional(),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  sortBy: z.enum(["createdAt", "dueDate"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// ---------- Response schemas ----------
export const taskResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  status: TaskStatusEnum,
  priority: TaskPriorityEnum,
  dueDate: z.string().datetime().nullable(),
  isOverdue: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const paginationMetaSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});

export const taskStatsSchema = z.object({
  total: z.number().int(),
  overdue: z.number().int(),
  byStatus: z.record(TaskStatusEnum, z.number().int()),
  byPriority: z.record(TaskPriorityEnum, z.number().int()),
});
