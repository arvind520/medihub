/**
 * FILE: server/src/routes/user.routes.js
 * PURPOSE: Handles user-related API endpoints.
 */
import { Router } from "express";
import { getAuth } from "@clerk/express";
import User from "../models/User.js";

const router = Router();

/**
 * GET /api/users/me
 * PROTECTED: Requires a valid Clerk token.
 * Purpose: Verifies that our backend can securely read the logged-in user.
 */
router.get("/me", async (req, res, next) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      success: true,
      user: {
        role: user.role,
        firstName: user.firstName,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/users/role
 * PROTECTED: Sets the user's role to 'patient' or 'helper'.
 */
router.put("/role", async (req, res, next) => {
  try {
    // 1. Manually get the auth state
    const { userId } = getAuth(req);

    // 2. If no userId, the user is not logged in
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { role } = req.body;

    // Validate the role
    if (!["patient", "helper"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // 3. Update the user in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      { role },
      { new: true },
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ error: "User not found in DB. Did the webhook fail?" });
    }

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    next(err); // Pass to our global error handler
  }
});

export default router;
