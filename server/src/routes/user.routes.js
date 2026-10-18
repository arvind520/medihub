/**
 * FILE: server/src/routes/user.routes.js
 * PURPOSE: Handles user-related API endpoints.
 */
import { Router } from "express";
import { getAuth } from "@clerk/express";

const router = Router();

/**
 * Middleware to protect routes using Clerk's newer getAuth() method.
 */
const requireAuth = (req, res, next) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // Attach userId to req so we can use it in our routes
  req.userId = userId;
  next();
};

/**
 * GET /api/users/me
 * PROTECTED: Requires a valid Clerk token.
 */
router.get("/me", requireAuth, (req, res) => {
  res.json({
    success: true,
    message: "Authenticated successfully on the backend!",
    clerkUserId: req.userId,
  });
});

export default router;
