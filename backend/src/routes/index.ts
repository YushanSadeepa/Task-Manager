import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { prisma } from "../lib/prisma";
import { TaskRepository } from "../repositories/task.repository";
import { TaskService } from "../services/task.service";
import { buildTaskRoutes } from "./task.routes";

// Composition root: wires repository -> service -> controller.
const taskRepository = new TaskRepository(prisma);
const taskService = new TaskService(taskRepository);
const taskController = new TaskController(taskService);

export const apiRouter = Router();
apiRouter.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));
apiRouter.use("/tasks", buildTaskRoutes(taskController));
