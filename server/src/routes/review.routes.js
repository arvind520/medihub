/**
 * FILE: server/src/routes/review.routes.js
 * PURPOSE: Handles submitting reviews and updating helper ratings.
 */
import { Router } from "express";
import { getAuth } from "@clerk/express";
import Review from "../models/Review.js";
import Event from "../models/Event.js";
import User from "../models/User.js";

const router = Router();

/**
 * POST /api/reviews
 * PROTECTED: Patient submits a rating for a completed event.
 */
router.post("/", async (req, res, next) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ error: "Unauthorized" });

    const { eventId, rating, comment } = req.body;

    // 1. Validate the event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.patientId !== clerkId) {
      return res
        .status(403)
        .json({ error: "You can only review your own events" });
    }
    if (event.status !== "completed") {
      return res
        .status(400)
        .json({ error: "You can only review completed events" });
    }

    // 2. Create the review
    const review = await Review.create({
      eventId,
      patientId: clerkId,
      helperId: event.helperId,
      rating,
      comment,
    });

    // 3. Calculate the Helper's new average rating
    // Find all reviews for this helper
    const allHelperReviews = await Review.find({ helperId: event.helperId });

    // Sum up all the ratings and divide by the number of reviews
    const totalRating = allHelperReviews.reduce(
      (sum, rev) => sum + rev.rating,
      0,
    );
    const avgRating = totalRating / allHelperReviews.length;

    // Update the Helper's User document
    await User.findOneAndUpdate(
      { clerkId: event.helperId },
      {
        avgRating: avgRating.toFixed(1), // Keep it to 1 decimal place (e.g. 4.5)
        totalReviews: allHelperReviews.length,
      },
    );

    res.status(201).json({ success: true, review });
  } catch (err) {
    // Handle duplicate review error (MongoDB unique index)
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "You have already reviewed this event" });
    }
    next(err);
  }
});

export default router;
