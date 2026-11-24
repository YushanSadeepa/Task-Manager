import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { buildTaskRoutes } from "./task.routes";

export const buildApiRouter = (taskController: TaskController): Router => {
  const router = Router();
  router.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));
  router.use("/tasks", buildTaskRoutes(taskController));
  return router;
};
