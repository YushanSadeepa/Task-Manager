import { Response } from "express";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const sendSuccess = <T>(res: Response, data: T, status = 200, meta?: PaginationMeta) =>
  res.status(status).json({ success: true, data, ...(meta && { meta }) });

export const sendError = (res: Response, status: number, message: string, details?: unknown) =>
  res.status(status).json({ success: false, error: { message, ...(details !== undefined && { details }) } });
