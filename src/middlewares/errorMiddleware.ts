import { NextFunction, Request, Response } from "express";
import logger from "@utils/logger";

export class HttpException extends Error {
  public status: number;
  public message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

export const ErrorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const status: number = error.status || 500;
    const message: string = error.message || "Something went wrong";

    logger.error(
      { error },
      `[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`
    );
    return res.status(status).json({
      message,
      status,
      stack: process.env.NODE_ENV === "development" ? error.stack : {},
    });
  } catch (error) {
    next(error);
  }
};
