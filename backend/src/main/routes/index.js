import { Router } from "express";
import { buildArRoutes } from "./ar.routes.js";

export function buildRoutes({ controllers }) {
  const router = Router();

  router.use("/api/v1", buildArRoutes({ controllers }));

  return router;
}
