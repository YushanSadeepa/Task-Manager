import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { sendError } from "../utils/apiResponse";

export const notFoundHandler = (req: Request, res: Response) =>
  sendError(res, 404, `Route ${req.method} ${req.originalUrl} not found`);

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
    return sendError(res, 400, "Validation failed", details);
  }
  if (err instanceof AppError) return sendError(res, err.statusCode, err.message, err.details);
  if (err instanceof SyntaxError && "body" in err) return sendError(res, 400, "Malformed JSON body");
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
    return sendError(res, 404, "Resource not found");
  }

  console.error(err);
  return sendError(res, 500, env.NODE_ENV === "production" ? "Internal server error" : String(err));
};
