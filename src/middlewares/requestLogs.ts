import env from "@settings/env";
import { Request, Response, NextFunction } from "express";
import loggerUtils from "@utils/logger";

const logger = loggerUtils.child({ middleware: "requestLogs" });

export const requestLogs = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const forwarded = (req?.headers["x-forwarded-for"] ||
    req?.headers["x-real-ip"]) as string;
  const ip = forwarded ? forwarded.split(/, /)[0] : req?.socket.remoteAddress;
  if (ip) {
    req.headers["user-ip"] = ip;
  }
  if (env.IS_PRODUCTION) {
    logger.info({
      method: req.method,
      path: req.path,
      xForwardedFor: req?.headers["x-forwarded-for"],
      xRealIp: req?.headers["x-real-ip"],
      remoteAddress: req?.socket.remoteAddress,
      ip,
      agent: req.headers["user-agent"],
    });
  }

  next();
};
