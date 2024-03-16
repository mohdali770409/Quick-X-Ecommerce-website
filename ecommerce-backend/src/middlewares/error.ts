import { Express, Response, Request, NextFunction } from "express";
import errorHandler from "../utils/utility-class.js";
import { controllerType } from "../types/types.js";
export const errorMiddleware = (
  err: errorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.message = err.message || "Internal server error";
  err.statusCode = err.statusCode || 500;
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};


