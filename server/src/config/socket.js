/**
 * FILE: server/src/config/socket.js
 * PURPOSE: Configures Socket.io for real-time communication.
 * HOW IT WORKS:
 *   1. Client connects and sends their Clerk token.
 *   2. We verify the token.
 *   3. We put the user in a "room" named after their Clerk ID.
 *   4. When an event happens (like a helper accepting), we emit
 *      to that specific room.
 */
import { Server } from "socket.io";
import { createClerkClient, verifyToken } from "@clerk/backend";

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Middleware to authenticate the socket connection
  io.use(async (socket, next) => {
    try {
      // The client will send the token in the auth object
      const token = socket.handshake.auth?.token;
      if (!token)
        return next(new Error("Authentication error: No token provided"));

      // Verify the token with Clerk
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      // Attach the verified Clerk ID to the socket
      socket.userId = payload.sub;
      next();
    } catch (err) {
      console.error("❌ Socket auth failed:", err.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Join a room named after the user's ID.
    // This allows us to send messages specifically to this user.
    socket.join(socket.userId);

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

// Helper function to get the `io` instance from other files
export function getIO() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}
