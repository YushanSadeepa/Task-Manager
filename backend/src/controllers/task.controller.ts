import { NextFunction, Request, Response } from "express";
import { ListTasksQueryDto } from "../dtos/task.dto";
import { TaskService } from "../services/task.service";
import { sendSuccess } from "../utils/apiResponse";

type Handler = (req: Request, res: Response) => Promise<unknown>;

// Wraps async handlers so rejected promises reach the error middleware.
const wrap = (fn: Handler) => (req: Request, res: Response, next: NextFunction) => {
  fn(req, res).catch(next);
};

export class TaskController {
  constructor(private readonly service: TaskService) {}

  list = wrap(async (req, res) => {
    const { items, meta } = await this.service.list(req.query as unknown as ListTasksQueryDto);
    return sendSuccess(res, items, 200, meta);
  });

  getById = wrap(async (req, res) => sendSuccess(res, await this.service.getById(req.params.id)));

  create = wrap(async (req, res) => sendSuccess(res, await this.service.create(req.body), 201));

  replace = wrap(async (req, res) => sendSuccess(res, await this.service.replace(req.params.id, req.body)));

  update = wrap(async (req, res) => sendSuccess(res, await this.service.update(req.params.id, req.body)));

  updateStatus = wrap(async (req, res) =>
    sendSuccess(res, await this.service.updateStatus(req.params.id, req.body.status)),
  );

  delete = wrap(async (req, res) => {
    await this.service.delete(req.params.id);
    return res.status(204).send();
  });

  stats = wrap(async (_req, res) => sendSuccess(res, await this.service.stats()));
}
