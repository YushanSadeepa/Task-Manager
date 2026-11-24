import { describe, expect, it } from "vitest";
import { taskFormSchema, toTaskInput } from "@/schemas/taskSchema";

const valid = { title: "Write docs", description: "", status: "TODO", priority: "LOW", dueDate: "" } as const;

describe("taskFormSchema", () => {
  it("accepts valid input", () => {
    expect(taskFormSchema.safeParse(valid).success).toBe(true);
  });

  it("returns friendly messages", () => {
    const r = taskFormSchema.safeParse({ ...valid, title: "ab" });
    expect(!r.success && r.error.issues[0].message).toBe("Title must be at least 3 characters");
  });

  it("rejects invalid dates and too-long descriptions", () => {
    expect(taskFormSchema.safeParse({ ...valid, dueDate: "not-a-date" }).success).toBe(false);
    expect(taskFormSchema.safeParse({ ...valid, description: "x".repeat(2001) }).success).toBe(false);
  });
});

describe("toTaskInput", () => {
  it("maps empty optional fields to null and dates to ISO strings", () => {
    expect(toTaskInput(valid)).toMatchObject({ description: null, dueDate: null });
    expect(toTaskInput({ ...valid, dueDate: "2026-12-01" }).dueDate).toBe("2026-12-01T00:00:00.000Z");
  });
});
