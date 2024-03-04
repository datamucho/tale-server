import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import getEnv from "../utils/env";

interface ErrorWithStatus extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  errmsg?: string;
  errors?: any;
  path?: string;
  value?: string;
  code?: number;
}

const handleCastErrorDB = (err: ErrorWithStatus): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: ErrorWithStatus): AppError => {
  const match = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/) : null;
  const value = match ? match[0] : "unknown";

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

interface ValidationError {
  message: string;
}

const handleValidationErrorDB = (err: ErrorWithStatus): AppError => {
  const errors = Object.values(
    err.errors as Record<string, ValidationError>
  ).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = (): AppError =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = (): AppError =>
  new AppError("Your token has expired! Please log in again.", 401);

const sendError = (err: ErrorWithStatus, req: Request, res: Response): void => {
  res.status(err.statusCode!).json({
    status: err.status,
    message: err.message,
    ...(getEnv("NODE_ENV", "production") === "development" && {
      error: err,
      stack: err.stack,
    }),
  });
};

export default (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };
  console.log(error.name);
  if (error.name === "CastError") error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === "ValidationError") error = handleValidationErrorDB(error);
  if (error.name === "JsonWebTokenError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

  sendError(error, req, res);
};
