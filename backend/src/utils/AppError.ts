export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }

  static notFound(message = "Resource not found") {
    return new AppError(404, message);
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, message, details);
  }
}
