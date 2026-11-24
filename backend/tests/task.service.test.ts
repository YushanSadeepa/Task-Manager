import { beforeEach, describe, expect, it } from "vitest";
import { TaskService } from "../src/services/task.service";
import { AppError } from "../src/utils/AppError";
import { InMemoryTaskRepository } from "./helpers/InMemoryTaskRepository";

const day = 86_400_000;
let service: TaskService;

beforeEach(() => {
  service = new TaskService(new InMemoryTaskRepository());
});

const make = (over: Record<string, unknown> = {}) =>
  service.create({ title: "Task", status: "TODO", priority: "MEDIUM", ...over } as never);

describe("TaskService", () => {
  it("paginates and reports meta", async () => {
    for (let i = 0; i < 25; i++) await make({ title: `Task ${i}` });
    const r = await service.list({ page: 3, limit: 10, sortBy: "createdAt", order: "desc" });
    expect(r.items).toHaveLength(5);
    expect(r.meta).toEqual({ page: 3, limit: 10, total: 25, totalPages: 3 });
  });

  it("filters by search, status and priority", async () => {
    await make({ title: "Alpha report", priority: "HIGH" });
    await make({ title: "Beta report", status: "COMPLETED" });
    const r = await service.list({ page: 1, limit: 10, sortBy: "createdAt", order: "desc", search: "alpha" });
    expect(r.items.map((t) => t.title)).toEqual(["Alpha report"]);
    const done = await service.list({ page: 1, limit: 10, sortBy: "createdAt", order: "desc", status: "COMPLETED" });
    expect(done.meta.total).toBe(1);
  });

  it("throws 404 for unknown ids on get, update and delete", async () => {
    const id = "00000000-0000-4000-8000-000000000000";
    await expect(service.getById(id)).rejects.toBeInstanceOf(AppError);
    await expect(service.update(id, { title: "x" })).rejects.toMatchObject({ statusCode: 404 });
    await expect(service.delete(id)).rejects.toMatchObject({ statusCode: 404 });
  });

  it("PUT replace resets omitted optional fields, PATCH keeps them", async () => {
    const t = await make({ description: "keep me", dueDate: new Date(Date.now() + day) });
    const patched = await service.update(t.id, { priority: "HIGH" });
    expect(patched.description).toBe("keep me");

    const replaced = await service.replace(t.id, { title: "New title", status: "TODO", priority: "LOW" });
    expect(replaced.description).toBeNull();
    expect(replaced.dueDate).toBeNull();
  });

  it("computes overdue only for non-completed past-due tasks", async () => {
    const past = new Date(Date.now() - day);
    const overdue = await make({ title: "Late", dueDate: past });
    await make({ title: "Done late", dueDate: past, status: "COMPLETED" });
    await make({ title: "Future", dueDate: new Date(Date.now() + day) });

    expect((await service.getById(overdue.id)).isOverdue).toBe(true);
    const stats = await service.stats();
    expect(stats).toMatchObject({ total: 3, overdue: 1 });
    expect(stats.byStatus).toEqual({ TODO: 2, IN_PROGRESS: 0, COMPLETED: 1 });
  });
});
