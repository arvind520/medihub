/**
 * FILE: server/src/models/Review.js
 * PURPOSE: Stores the rating a patient gives to a helper after a job.
 */
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      unique: true, // A patient can only review a specific event ONCE
    },
    patientId: {
      type: String, // Clerk ID of the patient
      required: true,
    },
    helperId: {
      type: String, // Clerk ID of the helper
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Review", reviewSchema);
