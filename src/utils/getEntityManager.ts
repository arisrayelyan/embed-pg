import { Application } from "express-serve-static-core";
import { EntityManager } from "@mikro-orm/postgresql";

const getEntityManager = async (app: Application): Promise<EntityManager> => {
  // check if orm is set
  while (!app.get("orm")) {
    // wait for 100ms
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const orm = app.get("orm");
  return orm.em;
};

export default getEntityManager;
