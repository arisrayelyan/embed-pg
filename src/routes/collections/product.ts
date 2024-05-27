import type { Application } from "express-serve-static-core";

import { Router } from "express";
import { ProductService } from "@services/ProductService";
import {
  createProductInput,
  deleteProductInput,
  searchProductInput,
  updateProductInput,
} from "@common/schemas/product.schema";
import {
  baseGetQuerySchema,
  baseQuerySchema,
} from "@common/schemas/common.schema";
import getEntityManager from "@utils/getEntityManager";
import loggerUtil from "@utils/logger";

export default function ProductRouter(app: Application): Router {
  const logger = loggerUtil.child({ router: "/product" });

  const router = Router();

  router.post("/", async (req, res) => {
    const body = createProductInput.safeParse(req.body);
    const query = baseQuerySchema.safeParse(req.query);
    logger.info(
      { body: req.body, query: req.query },
      "Request received for [post]/ endpoint"
    );
    if (!body.success) {
      logger.error({ error: body.error }, "Request body validation error");
      return res.status(400).json({
        success: false,
        error: body.error.issues,
      });
    }
    if (!query.success) {
      logger.error({ error: query.error }, "Request query validation error");
      return res.status(400).json({
        success: false,
        error: query.error.issues,
      });
    }

    try {
      const em = await getEntityManager(app);
      const service = new ProductService({ em });
      const data = await service.add(body.data, query.data);
      return res.json(data);
    } catch (error) {
      logger.error({ error }, "Error occurred while adding data");
      return res.status(400).json({
        success: false,
        error: "Bad request",
      });
    }
  });

  router.put("/:key", async (req, res) => {
    const body = updateProductInput.safeParse({
      key: req.params.key,
      ...req.body,
    });
    logger.info(
      { body: req.body, key: req.params.key },
      "Request received for [put]/:key endpoint"
    );

    if (!body.success) {
      logger.error(
        { error: body.error.issues },
        "Request body validation error"
      );
      return res.status(400).json({
        success: false,
        error: body.error.issues,
      });
    }

    try {
      const em = await getEntityManager(app);
      const service = new ProductService({ em });
      const data = await service.update(body.data);
      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      logger.error({ error }, "Error occurred while updating data");
      return res.status(400).json({
        success: false,
        error: "Bad request",
      });
    }
  });

  router.delete("/:key", async (req, res) => {
    const body = deleteProductInput.safeParse({
      key: req.params.key,
      ...req.body,
    });
    logger.info(
      { body: req.body, key: req.params.key },
      "Request received for [delete]/:key endpoint"
    );

    if (!body.success) {
      logger.error({ error: body.error }, "Request body validation error");
      return res.status(400).json({
        success: false,
        error: body.error.issues,
      });
    }

    try {
      const em = await getEntityManager(app);
      const service = new ProductService({ em });
      const data = await service.delete(body.data);
      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      logger.error({ error }, "Error occurred while deleting data");
      return res.status(400).json({
        success: false,
        error: "Bad request",
      });
    }
  });

  router.post("/search", async (req, res) => {
    const body = searchProductInput.safeParse(req.body);
    logger.info(
      { body: req.body },
      "Request received for [post]/search endpoint"
    );

    if (!body.success) {
      logger.error({ error: body.error }, "Request body validation error");
      return res.status(400).json({
        success: false,
        error: body.error.issues,
      });
    }

    try {
      const em = await getEntityManager(app);
      const service = new ProductService({ em });
      const data = await service.search(body.data);
      return res.json(data);
    } catch (error) {
      logger.error({ error }, "Error occurred while searching data");
      return res.status(400).json({
        success: false,
        error: "Bad request",
      });
    }
  });

  router.get("/:key", async (req, res) => {
    const query = baseGetQuerySchema.safeParse({
      key: req.params.key,
    });
    logger.info(
      {
        query: {
          key: req.params?.key,
          ...req.query,
        },
      },
      "Request received for [get]/:key endpoint"
    );

    if (!query.success) {
      logger.error({ error: query.error }, "Request query validation error");
      return res.status(400).json({
        success: false,
        error: query.error.issues,
      });
    }

    try {
      const em = await getEntityManager(app);
      const service = new ProductService({ em });
      const data = await service.get(query.data.key);
      return res.json(data);
    } catch (error) {
      logger.error({ error }, "Error occurred while getting data");
      return res.status(400).json({
        success: false,
        error: "Bad request",
      });
    }
  });

  return router;
}
