import type { Request, Response, NextFunction } from "express";

export function validatePagination(req: Request, _res: Response, next: NextFunction): void {
  const page = parseInt(req.query.page as string, 10);
  const pageSize = parseInt(req.query.pageSize as string, 10);

  if (req.query.page && (isNaN(page) || page < 1)) {
    return next(new ValidationError("Query parameter 'page' must be a positive integer."));
  }
  if (req.query.pageSize && (isNaN(pageSize) || pageSize < 1 || pageSize > 100)) {
    return next(new ValidationError("Query parameter 'pageSize' must be between 1 and 100."));
  }
  next();
}

export function validateDepth(req: Request, _res: Response, next: NextFunction): void {
  const depth = parseInt((req.query.depth as string) || "1", 10);
  if (isNaN(depth) || depth < 1 || depth > 3) {
    return next(new ValidationError("Query parameter 'depth' must be an integer between 1 and 3."));
  }
  next();
}

export class ValidationError extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
