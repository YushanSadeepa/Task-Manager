import { z } from "zod";

export const TaskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]);
export const TaskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

// Sanitization: strip HTML tags and trim whitespace from free text.
const sanitized = z.string().transform((v) => v.replace(/<[^>]*>/g, "").trim());

const title = sanitized.pipe(
  z.string().min(3, "Title must be at least 3 characters").max(150, "Title must be at most 150 characters"),
);
const description = sanitized.pipe(z.string().max(2000, "Description must be at most 2000 characters"));
const dueDate = z.coerce.date({ invalid_type_error: "Due date must be a valid date" });

export const createTaskSchema = z.object({
  title,
  description: description.optional().nullable(),
  status: TaskStatusEnum.default("TODO"),
  priority: TaskPriorityEnum.default("MEDIUM"),
  dueDate: dueDate.optional().nullable(),
});

export const updateTaskSchema = z
  .object({
    title: title.optional(),
    description: description.optional().nullable(),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    dueDate: dueDate.optional().nullable(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "At least one field must be provided" });

export const updateStatusSchema = z.object({ status: TaskStatusEnum });

export const idParamSchema = z.object({ id: z.string().uuid("Invalid task id") });

export const listTasksQuerySchema = z.object({
  search: z.string().trim().max(150).optional(),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  sortBy: z.enum(["createdAt", "dueDate"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
