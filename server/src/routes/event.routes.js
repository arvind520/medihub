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
        helperPhone: user.phone,
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
/**
 * PATCH /api/events/:id/complete
 * PROTECTED: Marks an accepted event as completed. Only the assigned helper can do this.
 */
router.patch("/:id/complete", async (req, res, next) => {
  try {
    // 👇 FIX: Use getAuth(req) instead of req.auth.userId
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    // 1. Find the event
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    // 2. Ensure the person trying to complete it is the assigned helper
    if (event.helperId !== clerkId) {
      return res
        .status(403)
        .json({ error: "You are not assigned to this event" });
    }

    // 3. Ensure the event is actually in 'accepted' status
    if (event.status !== "accepted") {
      return res
        .status(400)
        .json({ error: "Event cannot be completed from its current status" });
    }

    // 4. Mark it completed
    event.status = "completed";
    await event.save();

    // 5. Emit real-time update to the patient
    try {
      const io = getIO();
      io.to(event.patientId).emit("event:completed", {
        message: "Your helper has marked the job as completed!",
        event,
      });
    } catch (err) {
      console.error("Socket emit failed:", err.message);
    }

    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/events/helper/active
 * PROTECTED: Fetches events assigned to the logged-in helper.
 */
router.get("/helper/active", async (req, res, next) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const events = await Event.find({
      helperId: clerkId,
      status: { $in: ["accepted", "ongoing"] },
    }).sort({ date: 1 });

    // Fetch the patient details for these events securely
    const eventsWithPatientInfo = await Promise.all(
      events.map(async (ev) => {
        // We find the patient user based on the event's patientId (which is their clerkId)
        const patient = await User.findOne({ clerkId: ev.patientId });

        // Convert the Mongoose document to a plain object so we can add a field
        const evObj = ev.toObject();

        // Attach the patient's phone (or fallback if not found)
        evObj.patientPhone = patient?.phone || "Phone not provided";

        return evObj;
      }),
    );

    res.json({ success: true, events: eventsWithPatientInfo });
  } catch (err) {
    next(err);
  }
});

export default router;
