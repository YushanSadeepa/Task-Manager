import { z } from "zod";
import { TaskInput } from "@/types/task";

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must be at most 150 characters"),
  description: z.string().trim().max(2000, "Description must be at most 2000 characters").optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z
    .string()
    .optional()
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Enter a valid date"),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const toTaskInput = (v: TaskFormValues): TaskInput => ({
  title: v.title,
  description: v.description ? v.description : null,
  status: v.status,
  priority: v.priority,
  dueDate: v.dueDate ? new Date(v.dueDate).toISOString() : null,
});
