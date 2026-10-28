/**
 * FILE: server/src/routes/admin.routes.js
 * PURPOSE: Endpoints only an Admin can access.
 */
import { Router } from "express";
import { getAuth } from "@clerk/express";
import User from "../models/User.js";

const router = Router();

// Middleware to ensure the user is an admin
const requireAdmin = async (req, res, next) => {
  const { userId: clerkId } = getAuth(req);
  const user = await User.findOne({ clerkId });

  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

/**
 * GET /api/admin/helpers
 * PROTECTED: Fetches all helpers waiting for KYC approval.
 */
router.get("/helpers", requireAdmin, async (req, res, next) => {
  try {
    const helpers = await User.find({
      role: "helper",
      kycStatus: "pending",
    });
    res.json({ success: true, helpers });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/approve/:clerkId
 * PROTECTED: Approves a helper.
 */
router.post("/approve/:clerkId", requireAdmin, async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { clerkId: req.params.clerkId },
      { isApproved: true, kycStatus: "approved" },
      { new: true },
    );
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

export default router;
