/**
 * FILE: server/src/routes/event.routes.js
 * PURPOSE: API endpoints for creating and viewing events.
 */
import { Router } from "express";
import { getAuth } from "@clerk/express";
import Event from "../models/Event.js";
import User from "../models/User.js";

const router = Router();

/**
 * POST /api/events
 * PROTECTED: Only patients can create events.
 */
router.post("/", async (req, res, next) => {
  try {
    // clerkMiddleware() (see server.js) already ran and attached req.auth.
    // getAuth(req) is the supported way to read it — `req.auth` is a function
    // in @clerk/express v2, so `req.auth.userId` would be undefined.
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // 1. Verify user exists and is a patient
    const user = await User.findOne({ clerkId });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role !== "patient") {
      return res.status(403).json({ error: "Only patients can create events" });
    }

    // 2. Extract data from request body
    const { hospitalName, date, durationHours, requirements, notes } = req.body;

    // 3. Basic validation
    if (!hospitalName || !date || !requirements || requirements.length === 0) {
      return res.status(400).json({ error: "Please fill all required fields" });
    }

    // 4. Create the event in MongoDB
    const newEvent = await Event.create({
      patientId: clerkId,
      hospitalName,
      date: new Date(date),
      durationHours: durationHours || 2,
      requirements,
      notes,
    });

    res.status(201).json({ success: true, event: newEvent });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/events/mine
 * PROTECTED: Fetches events created by the logged-in patient.
 */
router.get("/mine", async (req, res, next) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Find all events for this patient, newest first
    const events = await Event.find({ patientId: clerkId }).sort({
      createdAt: -1,
    });

    res.json({ success: true, events });
  } catch (err) {
    next(err);
  }
});

export default router;
