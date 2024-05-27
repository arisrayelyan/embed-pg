import { Router } from "express";

const router = Router();

/* GET home page. */
router.get("/", async (_req, res) => {
  res.json({
    message: "Welcome EmbedPg API!",
  });
});

export default router;
