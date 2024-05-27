import type { Application } from "express-serve-static-core";

// ! embedPg import routers <- don't remove this comment
import ProductRouter from "./product";

export default async function initRouters(app: Application) {
  // ! embedPg configure routers <- don't remove this comment
  app.use(`/product`, ProductRouter(app));
}
