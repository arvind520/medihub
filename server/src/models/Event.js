/**
 * FILE: server/src/models/Event.js
 * PURPOSE: Defines the schema for an Event (a patient's request for help).
 * RELATIONSHIPS:
 *   - Links to a Patient (via clerkId)
 *   - Will link to a Helper later when accepted (via helperId)
 */
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    // Who created this? (We store the Patient's Clerk ID for easy lookup)
    patientId: {
      type: String,
      required: true,
      index: true,
    },

    // Event Details
    hospitalName: { type: String, required: true },
    date: { type: Date, required: true },
    durationHours: { type: Number, required: true, default: 2 }, // Estimated time needed

    // What kind of help is needed? (Checkboxes on the frontend)
    requirements: {
      type: [String],
      enum: ["queue", "doctor", "guide", "medicine", "paperwork"],
      required: true,
    },

    // Free-text notes from the patient
    notes: { type: String, default: "" },

    // Lifecycle of the event
    status: {
      type: String,
      enum: [
        "pending_payment",
        "open",
        "accepted",
        "ongoing",
        "completed",
        "cancelled",
      ],
      default: "pending_payment", // Starts as 'open' so helpers can find it
    },

    // Who accepted it? (Filled in Phase 3)
    helperId: { type: String, default: null },

    // Payment info (Filled in Phase 5)
    amount: { type: Number, default: 199 }, // MVP hardcoded price for now
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("Event", eventSchema);
