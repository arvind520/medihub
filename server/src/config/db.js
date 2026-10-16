/**
 * FILE: server/src/config/db.js
 * PURPOSE: Connects our Express app to MongoDB using Mongoose.
 * CALLED FROM: server/src/server.js at startup.
 *
 * WHY SEPARATE FILE? Keeps server.js focused on HTTP setup.
 */
import mongoose from "mongoose";

/**
 * connectDB — establishes MongoDB connection.
 * Exits process if connection fails so we don't run a broken server.
 */
export async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI;

    // Fail fast with a clear message if env var is missing
    if (!uri) {
      throw new Error(
        "MONGODB_URI is missing. Add it to server/.env (see .env.example)."
      );
    }

    // Mongoose 8+ has strictQuery on by default; connection is async
    const conn = await mongoose.connect(uri);

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // Stop the whole server — no DB, no point running
  }
}
