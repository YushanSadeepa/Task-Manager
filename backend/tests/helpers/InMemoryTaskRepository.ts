import { randomUUID } from "node:crypto";
import type { Task, TaskPriority, TaskStatus } from "@prisma/client";
import type { CreateTaskDto, UpdateTaskDto } from "../../src/dtos/task.dto";
import type { ITaskRepository, TaskFilters } from "../../src/repositories/task.repository";

type Match = Pick<TaskFilters, "search" | "status" | "priority">;

export class InMemoryTaskRepository implements ITaskRepository {
  private items: Task[] = [];
  private tick = 0;

  private matches(t: Task, f: Match) {
    return (
      (!f.search || t.title.toLowerCase().includes(f.search.toLowerCase())) &&
      (!f.status || t.status === f.status) &&
      (!f.priority || t.priority === f.priority)
    );
  }

  async findMany(f: TaskFilters): Promise<Task[]> {
    const dir = f.order === "asc" ? 1 : -1;
    return this.items
      .filter((t) => this.matches(t, f))
      .sort((a, b) => {
        const av = a[f.sortBy]?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bv = b[f.sortBy]?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return (av - bv) * dir;
      })
      .slice(f.skip, f.skip + f.take);
  }

  async count(f: Match): Promise<number> {
    return this.items.filter((t) => this.matches(t, f)).length;
  }

  async findById(id: string): Promise<Task | null> {
    return this.items.find((t) => t.id === id) ?? null;
  }

  async create(data: CreateTaskDto): Promise<Task> {
    const at = new Date(Date.UTC(2026, 0, 1) + this.tick++ * 1000);
    const task: Task = {
      id: randomUUID(),
      title: data.title,
      description: data.description ?? null,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate ?? null,
      createdAt: at,
      updatedAt: at,
    };
    this.items.push(task);
    return task;
  }

  async update(id: string, data: UpdateTaskDto): Promise<Task> {
    const task = this.items.find((t) => t.id === id)!;
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) (task as Record<string, unknown>)[k] = v;
    });
    task.updatedAt = new Date();
    return task;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((t) => t.id !== id);
  }

  async countByStatus(): Promise<Record<TaskStatus, number>> {
    const r: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 0, COMPLETED: 0 };
    this.items.forEach((t) => r[t.status]++);
    return r;
  }

  async countByPriority(): Promise<Record<TaskPriority, number>> {
    const r: Record<TaskPriority, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    this.items.forEach((t) => r[t.priority]++);
    return r;
  }

  async countOverdue(now: Date): Promise<number> {
    return this.items.filter((t) => t.dueDate && t.dueDate < now && t.status !== "COMPLETED").length;
  }
}
