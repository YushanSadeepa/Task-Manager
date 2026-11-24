import { Prisma, PrismaClient, Task, TaskPriority, TaskStatus } from "@prisma/client";
import { CreateTaskDto, ListTasksQueryDto, UpdateTaskDto } from "../dtos/task.dto";

export interface TaskFilters extends Pick<ListTasksQueryDto, "search" | "status" | "priority" | "sortBy" | "order"> {
  skip: number;
  take: number;
}

// Abstraction the service depends on (Dependency Inversion).
export interface ITaskRepository {
  findMany(filters: TaskFilters): Promise<Task[]>;
  count(filters: Pick<TaskFilters, "search" | "status" | "priority">): Promise<number>;
  findById(id: string): Promise<Task | null>;
  create(data: CreateTaskDto): Promise<Task>;
  update(id: string, data: UpdateTaskDto): Promise<Task>;
  delete(id: string): Promise<void>;
  countByStatus(): Promise<Record<TaskStatus, number>>;
  countByPriority(): Promise<Record<TaskPriority, number>>;
  countOverdue(now: Date): Promise<number>;
}

export class TaskRepository implements ITaskRepository {
  constructor(private readonly db: PrismaClient) {}

  private buildWhere(f: Pick<TaskFilters, "search" | "status" | "priority">): Prisma.TaskWhereInput {
    return {
      ...(f.search && { title: { contains: f.search, mode: "insensitive" } }),
      ...(f.status && { status: f.status }),
      ...(f.priority && { priority: f.priority }),
    };
  }

  findMany(f: TaskFilters): Promise<Task[]> {
    const orderBy: Prisma.TaskOrderByWithRelationInput =
      f.sortBy === "dueDate" ? { dueDate: { sort: f.order, nulls: "last" } } : { createdAt: f.order };

    return this.db.task.findMany({ where: this.buildWhere(f), orderBy, skip: f.skip, take: f.take });
  }

  count(f: Pick<TaskFilters, "search" | "status" | "priority">): Promise<number> {
    return this.db.task.count({ where: this.buildWhere(f) });
  }

  findById(id: string): Promise<Task | null> {
    return this.db.task.findUnique({ where: { id } });
  }

  create(data: CreateTaskDto): Promise<Task> {
    return this.db.task.create({ data });
  }

  update(id: string, data: UpdateTaskDto): Promise<Task> {
    return this.db.task.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.db.task.delete({ where: { id } });
  }

  async countByStatus(): Promise<Record<TaskStatus, number>> {
    const rows = await this.db.task.groupBy({ by: ["status"], _count: { _all: true } });
    const result: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 0, COMPLETED: 0 };
    rows.forEach((r) => (result[r.status] = r._count._all));
    return result;
  }

  async countByPriority(): Promise<Record<TaskPriority, number>> {
    const rows = await this.db.task.groupBy({ by: ["priority"], _count: { _all: true } });
    const result: Record<TaskPriority, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    rows.forEach((r) => (result[r.priority] = r._count._all));
    return result;
  }

  countOverdue(now: Date): Promise<number> {
    return this.db.task.count({ where: { dueDate: { lt: now }, status: { not: "COMPLETED" } } });
  }
}
