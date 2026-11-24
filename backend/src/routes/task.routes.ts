import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { validate } from "../middlewares/validate";
import {
  createTaskSchema,
  idParamSchema,
  listTasksQuerySchema,
  updateStatusSchema,
  updateTaskSchema,
} from "../validations/task.validation";

export const buildTaskRoutes = (controller: TaskController): Router => {
  const router = Router();

  router.get("/stats", controller.stats); // must be declared before "/:id"
  router.get("/", validate({ query: listTasksQuerySchema }), controller.list);
  router.post("/", validate({ body: createTaskSchema }), controller.create);
  router.get("/:id", validate({ params: idParamSchema }), controller.getById);
  router.put("/:id", validate({ params: idParamSchema, body: updateTaskSchema }), controller.update);
  router.patch(
    "/:id/status",
    validate({ params: idParamSchema, body: updateStatusSchema }),
    controller.updateStatus,
  );
  router.delete("/:id", validate({ params: idParamSchema }), controller.delete);

  return router;
};
