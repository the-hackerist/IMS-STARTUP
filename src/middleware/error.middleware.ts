import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  if (err instanceof Error) {
    message = err.message;
  }

  // fix may not catch mysql errors well

  if (err instanceof Error || err instanceof AppError) {
    if (process.env.NODE_ENV === 'development') {
      return res.status(statusCode).json({
        success: false,
        message,
        stack: err.stack,
      });
    }
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};
