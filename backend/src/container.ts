import { TaskController } from "./controllers/task.controller";
import { prisma } from "./lib/prisma";
import { TaskRepository } from "./repositories/task.repository";
import { TaskService } from "./services/task.service";

// Composition root: the only place where concrete implementations are wired together.
const taskRepository = new TaskRepository(prisma);
const taskService = new TaskService(taskRepository);

export const taskController = new TaskController(taskService);
