import type { NextFunction, Request, Response } from "express";

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
  details?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: HttpError, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status ?? err.statusCode ?? 500;

  if (status >= 500) {
    console.error("Internal server error:", err);
  }

  res.status(status).json({
    message: err.message || "Unexpected error",
    details: err.details,
  });
}
