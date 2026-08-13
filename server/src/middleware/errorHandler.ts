import type { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
  statusCode?: number;
  details?: unknown;
}

export function errorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error internally without exposing credentials or raw driver internals to client
  console.error(`[Error] ${statusCode} - ${message}`);
  if (statusCode === 500 && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: statusCode === 500 ? "A database or internal server error occurred" : message,
      details: err.details || undefined,
    },
  });
}
