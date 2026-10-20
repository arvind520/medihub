/**
 * FILE: server/src/routes/user.routes.js
 * PURPOSE: Handles user-related API endpoints.
 */
import { Router } from "express";
import { getAuth } from "@clerk/express";

const router = Router();

/**
 * GET /api/users/me
 * PROTECTED: Requires a valid Clerk token.
 * Purpose: Verifies that our backend can securely read the logged-in user.
 */
router.get("/me", (req, res) => {
  const { userId } = getAuth(req);
  if (!userId)
    return res.status(401).json({ success: false, message: "Unauthorized" });

  res.json({
    success: true,
    message: "Authenticated successfully on the backend!",
    clerkUserId: userId,
  });
});

export default router;
