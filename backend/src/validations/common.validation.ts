import { z } from "zod";
import { sanitizeText } from "../utils/sanitize";

export const TASK_TITLE_MIN = 3;
export const TASK_TITLE_MAX = 150;
export const TASK_DESCRIPTION_MAX = 2000;

// Reusable, sanitized field-level rules. Request/response shapes are composed from these in /schemas.
export const titleRule = z
  .string({ required_error: "Title is required", invalid_type_error: "Title must be text" })
  .transform((v) => sanitizeText(v))
  .pipe(
    z
      .string()
      .min(TASK_TITLE_MIN, `Title must be at least ${TASK_TITLE_MIN} characters`)
      .max(TASK_TITLE_MAX, `Title must be at most ${TASK_TITLE_MAX} characters`),
  );

export const descriptionRule = z
  .string({ invalid_type_error: "Description must be text" })
  .transform((v) => sanitizeText(v, { multiline: true }))
  .pipe(z.string().max(TASK_DESCRIPTION_MAX, `Description must be at most ${TASK_DESCRIPTION_MAX} characters`));

export const dueDateRule = z.coerce.date({ invalid_type_error: "Due date must be a valid date" });

export const uuidRule = (name: string) => z.string().uuid(`Invalid ${name}`);
