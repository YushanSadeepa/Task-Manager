import { CreateTaskDto, ListTasksQueryDto, TaskResponseDto, TaskStatsDto, UpdateTaskDto } from "../dtos/task.dto";
import { TaskMapper } from "../mappers/task.mapper";
import { ITaskRepository } from "../repositories/task.repository";
import { PaginationMeta } from "../utils/apiResponse";
import { AppError } from "../utils/AppError";

export class TaskService {
  constructor(private readonly repo: ITaskRepository) {}

  async list(query: ListTasksQueryDto): Promise<{ items: TaskResponseDto[]; meta: PaginationMeta }> {
    const { page, limit, ...filters } = query;
    const [tasks, total] = await Promise.all([
      this.repo.findMany({ ...filters, skip: (page - 1) * limit, take: limit }),
      this.repo.count(filters),
    ]);
    return {
      items: TaskMapper.toResponseList(tasks),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(id: string): Promise<TaskResponseDto> {
    const task = await this.repo.findById(id);
    if (!task) throw AppError.notFound("Task not found");
    return TaskMapper.toResponse(task);
  }

  async create(dto: CreateTaskDto): Promise<TaskResponseDto> {
    return TaskMapper.toResponse(await this.repo.create(dto));
  }

  /** PUT semantics: full replacement. Omitted optional fields are reset to null. */
  async replace(id: string, dto: CreateTaskDto): Promise<TaskResponseDto> {
    await this.ensureExists(id);
    const task = await this.repo.update(id, {
      ...dto,
      description: dto.description ?? null,
      dueDate: dto.dueDate ?? null,
    });
    return TaskMapper.toResponse(task);
  }

  /** PATCH semantics: only provided fields change. */
  async update(id: string, dto: UpdateTaskDto): Promise<TaskResponseDto> {
    await this.ensureExists(id);
    return TaskMapper.toResponse(await this.repo.update(id, dto));
  }

  async updateStatus(id: string, status: NonNullable<UpdateTaskDto["status"]>): Promise<TaskResponseDto> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<void> {
    await this.ensureExists(id);
    await this.repo.delete(id);
  }

  async stats(): Promise<TaskStatsDto> {
    const [byStatus, byPriority, overdue] = await Promise.all([
      this.repo.countByStatus(),
      this.repo.countByPriority(),
      this.repo.countOverdue(new Date()),
    ]);
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
    return { total, overdue, byStatus, byPriority };
  }

  private async ensureExists(id: string): Promise<void> {
    if (!(await this.repo.findById(id))) throw AppError.notFound("Task not found");
  }
}
