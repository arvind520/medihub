/**
 * FILE: server/src/routes/event.routes.js
 * PURPOSE: API endpoints for creating and viewing events.
 */
import { Router } from "express";
import { getAuth } from "@clerk/express";
import Event from "../models/Event.js";
import User from "../models/User.js";
import { getIO } from "../config/socket.js";

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

/**
 * GET /api/events/open
 * PROTECTED: Fetches all 'open' events for helpers to see.
 */
router.get("/open", async (req, res, next) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    // 1. Verify user is a helper
    const user = await User.findOne({ clerkId });
    if (!user || user.role !== "helper") {
      return res.status(403).json({ error: "Only helpers can view this feed" });
    }

    // 2. Find all open events, sorted by date (soonest first)
    const events = await Event.find({ status: "open" }).sort({ date: 1 });

    res.json({ success: true, events });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/events/:id/accept
 * PROTECTED: Allows a helper to claim an open event.
 */
router.post("/:id/accept", async (req, res, next) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    // 1. Verify user is a helper
    const user = await User.findOne({ clerkId });
    if (!user || user.role !== "helper") {
      return res.status(403).json({ error: "Only helpers can accept events" });
    }

    // 2. Find the event and update it atomically.
    // We use findOneAndUpdate with { status: "open" } in the query.
    // This prevents two helpers from accepting the same event at the exact same millisecond.
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: req.params.id, status: "open" }, // Condition: Must be open
      {
        status: "accepted",
        helperId: clerkId,
      },
      { new: true }, // Return the updated document
    );

    if (!updatedEvent) {
      return res.status(400).json({
        error: "Event not found or already accepted by another helper.",
      });
    }

    // 👇 ADD THIS SOCKET EMIT BLOCK 👇
    try {
      const io = getIO();
      // Emit to the patient's room
      io.to(updatedEvent.patientId).emit("event:accepted", {
        message: "A helper has accepted your request!",
        event: updatedEvent,
      });
    } catch (err) {
      console.error("Socket emit failed:", err.message);
    }
    // 👆

    res.json({ success: true, event: updatedEvent });
  } catch (err) {
    next(err);
  }
});

export default router;
