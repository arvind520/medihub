/**
 * FILE: server/src/routes/health.routes.js
 * PURPOSE: Simple "is the API alive?" endpoint.
 * WHY? When we deploy, we (and hosting providers) can ping /health
 *      to check if the server is up.
 */
import { Router } from "express";

const router = Router();

/**
 * GET /api/health
 * Returns 200 with uptime info. No auth required.
 */
router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "medihub-api",
    time: new Date().toISOString(),
    uptime: process.uptime(), // seconds since server started
  });
});

export default router;
