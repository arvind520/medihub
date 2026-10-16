/**
 * FILE: server/src/server.js
 * PURPOSE: Main entry point for the MediHelp backend API.
 * BOOT ORDER:
 *   1. Load env vars
 *   2. Create Express app
 *   3. Apply security + parsing middleware
 *   4. Mount routes
 *   5. Attach error handlers
 *   6. Connect DB
 *   7. Start listening
 */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";
import healthRoutes from "./routes/health.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// ---- 1. Load environment variables from .env -------------------------------
dotenv.config();

// ---- 2. Create the Express application -------------------------------------
const app = express();

// ---- 3. Global middleware --------------------------------------------------

// helmet: sets secure HTTP headers (X-Frame-Options, CSP, etc.)
app.use(helmet());

// cors: allows requests ONLY from our frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // allow cookies/auth headers
  })
);

// express.json: parses JSON bodies into req.body
// limit: prevents huge payloads (DoS protection)
app.use(express.json({ limit: "1mb" }));

// express.urlencoded: parses form submissions
app.use(express.urlencoded({ extended: true }));

// rate-limit: basic protection against brute force & spam
// Applied globally for now; we'll tighten specific routes later.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // 300 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ---- 4. Routes -------------------------------------------------------------

// Simple request logger — helps during development
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.use("/api/health", healthRoutes);

// (Phase 1+) We'll mount /api/events, /api/users, etc. here later.

// ---- 5. Error handling (must be LAST) -------------------------------------
app.use(notFound);
app.use(errorHandler);

// ---- 6 + 7. Connect DB, then start server ---------------------------------
const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
  });
}

start();
