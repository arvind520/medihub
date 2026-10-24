/**
 * FILE: server/src/models/User.js
 * PURPOSE: Defines the schema for a User in MongoDB.
 * WHY: Clerk handles authentication (login), but MongoDB stores
 *      our app-specific data like roles, ratings, and wallet balance.
 */
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // The unique ID provided by Clerk (e.g., "user_2xyz...")
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: { type: String },
    lastName: { type: String },

    // ROLES: 'patient', 'helper', or 'admin'
    // Default is patient. They can switch to helper later.
    role: {
      type: String,
      enum: ["patient", "helper", "admin"],
      default: "patient",
    },

    // Optional fields for helpers (Phase 3+)
    // phone: { type: String },
    phone: { type: String, default: "+91 9999999999" }, // Dummy for now
    isApproved: { type: Boolean, default: false }, // Admin approves helpers
    avgRating: { type: Number, default: 0 },
  },
  { timestamps: true }, // Automatically adds createdAt and updatedAt
);

export default mongoose.model("User", userSchema);
