import type { NextFunction, Request, Response } from "express";

const errorHandler = (
  err: Error & { statusCode?: number; isOperational?: boolean },
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const isProduction = process.env.NODE_ENV === "production";

  if (err.isOperational && err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  return res.status(500).json({
    error: isProduction ? "Internal server error" : err.message,
  });
};

export default errorHandler;
