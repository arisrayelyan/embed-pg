import { NextFunction, Response } from "express";
import logger from "@utils/logger";
import { Request } from "express";
import { UserService } from "@services/UserService";
import { EntityManager } from "@mikro-orm/core";

export const AuthMiddleware =
  (em: EntityManager) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    const allowedPaths = ["/", "/favicon.ico", "/status"];
    const requestPath = req.path;
    if (allowedPaths.includes(requestPath)) {
      return next();
    }

    if (!authorization) {
      logger.error("[AuthMiddleware] Authorization header not found");
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }
    const service = new UserService({ em });
    const auth_token =
      authorization && typeof authorization === "string"
        ? authorization.split(" ")[1]
        : null;
    const isValid = await service.validate(auth_token as string);

    if (isValid) {
      return next();
    }

    logger.error(
      { auth_token },
      `[${req.method}] ${req.path} >> StatusCode:: 401, Message:: Unauthorized`
    );

    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  };

export default AuthMiddleware;
