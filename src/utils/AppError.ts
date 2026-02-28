export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;

    // ease of debugging,
    Error.captureStackTrace(this, this.constructor);
  }
}
