/**
 * FILE: client/src/hooks/useSocket.js
 * PURPOSE: A custom React hook to manage the Socket.io connection.
 *          It fetches the Clerk token and connects securely.
 */
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@clerk/clerk-react";

export default function useSocket() {
  const { getToken } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let newSocket;

    const connectSocket = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // Connect to backend (port 5000)
        newSocket = io("http://localhost:5000", {
          auth: { token }, // Send token to the backend middleware
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
          console.log("🔌 Connected to socket server");
        });

        newSocket.on("connect_error", (err) => {
          console.error("❌ Socket connection error:", err.message);
        });
      } catch (err) {
        console.error("Failed to get token for socket:", err);
      }
    };

    connectSocket();

    // Cleanup on unmount
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [getToken]);

  return socket;
}
