import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { TaskController } from "../src/controllers/task.controller";
import { TaskService } from "../src/services/task.service";
import { InMemoryTaskRepository } from "./helpers/InMemoryTaskRepository";

let app: ReturnType<typeof createApp>;

beforeEach(() => {
  app = createApp(new TaskController(new TaskService(new InMemoryTaskRepository())));
});

const create = async (body: Record<string, unknown> = { title: "Write tests" }) =>
  (await request(app).post("/api/tasks").send(body)).body.data;

describe("Tasks API", () => {
  it("POST creates a task (201) with defaults and sanitized input", async () => {
    const res = await request(app).post("/api/tasks").send({ title: "<b>Hello</b> world" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      success: true,
      data: { title: "Hello world", status: "TODO", priority: "MEDIUM", isOverdue: false },
    });
  });

  it("POST returns 400 with field-level details for invalid input", async () => {
    const res = await request(app).post("/api/tasks").send({ title: "ab", priority: "URGENT" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    const fields = res.body.error.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(["title", "priority"]));
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await request(app).post("/api/tasks").set("Content-Type", "application/json").send("{bad");
    expect(res.status).toBe(400);
  });

  it("GET list returns pagination meta", async () => {
    for (let i = 0; i < 12; i++) await create({ title: `Task ${i}` });
    const res = await request(app).get("/api/tasks?page=2&limit=5");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.meta).toEqual({ page: 2, limit: 5, total: 12, totalPages: 3 });
  });

  it("GET list rejects invalid query params", async () => {
    expect((await request(app).get("/api/tasks?status=WRONG")).status).toBe(400);
  });

  it("GET /stats is not shadowed by /:id", async () => {
    await create();
    const res = await request(app).get("/api/tasks/stats");
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ total: 1, overdue: 0 });
  });

  it("GET /:id validates uuid (400) and reports missing tasks (404)", async () => {
    expect((await request(app).get("/api/tasks/not-a-uuid")).status).toBe(400);
    expect((await request(app).get("/api/tasks/00000000-0000-4000-8000-000000000000")).status).toBe(404);
  });

  it("PUT replaces, PATCH partially updates, PATCH /status changes status", async () => {
    const t = await create({ title: "Original", description: "desc" });

    const put = await request(app).put(`/api/tasks/${t.id}`).send({ title: "Replaced" });
    expect(put.status).toBe(200);
    expect(put.body.data.description).toBeNull();

    const patch = await request(app).patch(`/api/tasks/${t.id}`).send({ priority: "HIGH" });
    expect(patch.body.data).toMatchObject({ title: "Replaced", priority: "HIGH" });

    const status = await request(app).patch(`/api/tasks/${t.id}/status`).send({ status: "COMPLETED" });
    expect(status.body.data.status).toBe("COMPLETED");

    expect((await request(app).patch(`/api/tasks/${t.id}`).send({})).status).toBe(400);
  });

  it("DELETE returns 204 and the task is gone", async () => {
    const t = await create();
    expect((await request(app).delete(`/api/tasks/${t.id}`)).status).toBe(204);
    expect((await request(app).get(`/api/tasks/${t.id}`)).status).toBe(404);
  });

  it("returns a JSON 404 for unknown routes", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
