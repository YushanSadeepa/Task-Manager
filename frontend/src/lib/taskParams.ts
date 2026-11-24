import { PAGE_SIZE, PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/constants";
import { TaskListParams, TaskPriority, TaskStatus } from "@/types/task";

const pick = <T extends string>(value: string | null, allowed: readonly T[]): T | undefined =>
  allowed.includes(value as T) ? (value as T) : undefined;

/**
 * Parses and validates list params from any source (URLSearchParams in the browser,
 * the searchParams prop on the server). Unknown values fall back to defaults.
 */
export function parseTaskParams(get: (key: string) => string | null): TaskListParams {
  return {
    search: get("search") ?? "",
    status: pick<TaskStatus>(get("status"), STATUS_OPTIONS.map((o) => o.value)),
    priority: pick<TaskPriority>(get("priority"), PRIORITY_OPTIONS.map((o) => o.value)),
    sortBy: pick(get("sortBy"), ["createdAt", "dueDate"] as const) ?? "createdAt",
    order: pick(get("order"), ["asc", "desc"] as const) ?? "desc",
    page: Math.max(1, Number(get("page")) || 1),
    limit: PAGE_SIZE,
  };
}

// Board view loads up to the API maximum in one request and groups by status on the client.
export const BOARD_PARAMS: TaskListParams = {
  search: "",
  sortBy: "createdAt",
  order: "desc",
  page: 1,
  limit: 100,
};
