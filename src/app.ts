import env from "@settings/env";

import express, { Application } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import favicon from "serve-favicon";

// native routers
import indexRouter from "./routes/index";

// generated routers
import initRouters from "./routes/collections";

// middleware
import { ErrorMiddleware } from "./middlewares/errorMiddleware";
import { requestLogs } from "./middlewares/requestLogs";
import authMiddleware from "./middlewares/authMiddleware";

import dbConnection from "@database/index";
import { RequestContext } from "@mikro-orm/core";

const app: Application = express();

(async () => {
  // db connection
  const orm = await dbConnection(app);
  const em = orm.em.fork();
  app.use((_req, _res, next) => {
    RequestContext.create(orm.em, next);
  });

  // middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(compression());
  app.use(express.static(path.join(__dirname, "../public")));
  app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
  app.use(requestLogs);
  app.use(authMiddleware(em));

  // security
  if (env.IS_PRODUCTION) {
    app.use(helmet());
    app.enable("trust proxy");
  }

  app.use(
    cors(
      env.IS_PRODUCTION
        ? {
            origin: env.CORS_ORIGINS.split(",") || [],
            methods: "GET, POST, OPTIONS, PUT, PATCH, DELETE",
            allowedHeaders:
              "Origin, Accept, X-Requested-With, Content-Type, Authorization, Cache-Control, Pragma, csrf-token, x-api-token",
            credentials: true,
          }
        : undefined
    )
  );
  // express routes
  app.use("/", indexRouter);
  // generated routes
  await initRouters(app);

  // catch 404 and forward to error handler
  app.use((_req, _res, next) => {
    next({
      status: 404,
      message: "Not Found",
    });
  });

  // error handler
  app.use(ErrorMiddleware);
})();

export default app;
