/**
 * FILE: client/src/hooks/useSocket.js
 * PURPOSE: A custom React hook to manage the Socket.io connection.
 *          UPDATED: Now fetches a fresh token on every reconnect attempt
 *          to prevent "JWT expired" errors.
 */
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@clerk/clerk-react";

export default function useSocket() {
  const { getToken } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // We define the socket connection options here.
    // The `auth` property can be a function that Socket.io will call
    // every time it needs to authenticate (initial connect OR reconnect).
    const newSocket = io("http://localhost:5000", {
      auth: async (cb) => {
        try {
          // getToken() will fetch a fresh token from Clerk
          const token = await getToken();
          cb({ token });
        } catch (err) {
          console.error("Failed to get fresh token for socket", err);
          cb({ token: null });
        }
      },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🔌 Connected to socket server");
    });

    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [getToken]);

  return socket;
}
