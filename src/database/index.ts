import configs from "./config";
import { MikroORM } from "@mikro-orm/core";
import loggerUtil from "@utils/logger";
import { Application } from "express";

const logger = loggerUtil.child({ module: "mikro-orm" });

export const connect = async (app?: Application, silent = false) => {
  const mikroOrm = await MikroORM.init(configs);

  if (app) {
    app.set("orm", mikroOrm);
  }

  const isConnected = await mikroOrm.isConnected();

  if (isConnected) {
    !silent && logger.info("Database connected successfully");
  } else {
    !silent && logger.error({}, "Error while connection to database");
    process.exit(1);
  }
  return mikroOrm;
};

export const disconnect = async (app: Application) => {
  const mikroOrm = app.get("orm") as MikroORM;
  await mikroOrm.close();
  app.set("orm", null);
};

export default connect;
