import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env";
import { TaskController } from "./controllers/task.controller";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { buildApiRouter } from "./routes";

// The controller is injected so tests can run the real HTTP stack against an in-memory repository.
export const createApp = (taskController: TaskController) => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN.split(",") }));
  app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));
  app.use(express.json({ limit: "10kb" }));

  app.use("/api", buildApiRouter(taskController));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
