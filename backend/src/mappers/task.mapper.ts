import { Task } from "@prisma/client";
import { TaskResponseDto } from "../dtos/task.dto";

export class TaskMapper {
  static toResponse(task: Task, now = new Date()): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      isOverdue: !!task.dueDate && task.dueDate < now && task.status !== "COMPLETED",
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  static toResponseList(tasks: Task[]): TaskResponseDto[] {
    const now = new Date();
    return tasks.map((t) => TaskMapper.toResponse(t, now));
  }
}
