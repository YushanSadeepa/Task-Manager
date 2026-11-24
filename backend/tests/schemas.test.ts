import { describe, expect, it } from "vitest";
import {
  createTaskSchema,
  idParamSchema,
  listTasksQuerySchema,
  updateTaskSchema,
} from "../src/schemas/task.schema";

describe("createTaskSchema", () => {
  it("applies defaults and sanitizes the title", () => {
    const r = createTaskSchema.parse({ title: "  <i>Write</i> docs " });
    expect(r).toMatchObject({ title: "Write docs", status: "TODO", priority: "MEDIUM" });
  });

  it("rejects short titles with a meaningful message", () => {
    const r = createTaskSchema.safeParse({ title: "ab" });
    expect(r.success).toBe(false);
    expect(!r.success && r.error.issues[0].message).toMatch(/at least 3/);
  });

  it("rejects invalid dates and enum values", () => {
    expect(createTaskSchema.safeParse({ title: "Valid", dueDate: "nope" }).success).toBe(false);
    expect(createTaskSchema.safeParse({ title: "Valid", status: "DONE" }).success).toBe(false);
  });
});

describe("updateTaskSchema", () => {
  it("requires at least one field", () => {
    expect(updateTaskSchema.safeParse({}).success).toBe(false);
    expect(updateTaskSchema.safeParse({ priority: "HIGH" }).success).toBe(true);
  });
});

describe("listTasksQuerySchema", () => {
  it("coerces and defaults pagination/sorting", () => {
    expect(listTasksQuerySchema.parse({ page: "2" })).toMatchObject({
      page: 2,
      limit: 10,
      sortBy: "createdAt",
      order: "desc",
    });
  });

  it("caps limit at 100", () => {
    expect(listTasksQuerySchema.safeParse({ limit: "500" }).success).toBe(false);
  });
});

describe("idParamSchema", () => {
  it("requires a uuid", () => {
    expect(idParamSchema.safeParse({ id: "123" }).success).toBe(false);
  });
});
