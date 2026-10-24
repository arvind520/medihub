/**
 * FILE: client/src/pages/Dashboard.jsx
 * PURPOSE: Acts as a router. Checks the user's role from the DB
 *          and renders the Patient or Helper view accordingly.
 */
import { useState, useEffect } from "react";
import { useUser, useAuth, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import useSocket from "../hooks/useSocket"; // 👈 Import the hook
import CreateEventForm from "../components/CreateEventForm";
import HelperDashboard from "../components/HelperDashboard";

export default function Dashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [role, setRole] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket(); // 👈 Initialize socket

  const initializeDashboard = async () => {
    try {
      const token = await getToken();

      // 1. Fetch user data to get the role
      const userRes = await fetch("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();

      // If /me route isn't updated to return the DB user, we might need a workaround.
      // Let's assume we updated /me or we fetch it here.
      // (Note: If your /me route just returns `clerkUserId`, we need to update it below).

      // For now, let's assume role is 'patient' for testing if we can't fetch it.
      // In Step 4, we will update the backend /me route to return the full DB user!
      setRole(userData.user?.role || "patient");

      // 2. If patient, fetch their events
      if (userData.user?.role === "patient") {
        const evRes = await fetch("http://localhost:5000/api/events/mine", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const evData = await evRes.json();
        if (evData.success) setEvents(evData.events);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeDashboard();
  }, []);

  // 👇 Add this useEffect to listen for socket events
  useEffect(() => {
    if (!socket) return;

    socket.on("event:accepted", (data) => {
      console.log("Realtime update received:", data);
      alert("🔔 " + data.message);

      // Update the event in the local state instantly
      setEvents((prevEvents) =>
        prevEvents.map((ev) => (ev._id === data.event._id ? data.event : ev)),
      );
    });

    return () => {
      socket.off("event:accepted");
    };
  }, [socket]);
  // 👆

  const handleEventCreated = (newEvent) => {
    setEvents([newEvent, ...events]);
  };

  if (loading)
    return <div className="p-10 text-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Navbar */}
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-sky-700">
          MediHelp ({role === "patient" ? "Patient" : "Helper"})
        </h1>
        <div className="flex items-center gap-4">
          <Link
            to="/select-role"
            className="text-sm text-gray-500 hover:text-sky-600"
          >
            Switch Role
          </Link>
          <UserButton />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-4 mt-8">
        <h2 className="text-2xl font-semibold mb-6">
          Welcome, {user?.firstName || "User"}!
        </h2>

        {/* Conditionally render based on role */}
        {role === "patient" ? (
          <>
            <CreateEventForm onEventCreated={handleEventCreated} />
            <h3 className="text-xl font-bold mb-4">Your Requests</h3>
            {events.length === 0 ? (
              <p className="text-gray-500 bg-white p-6 rounded-lg shadow-sm text-center">
                No requests yet.
              </p>
            ) : (
              <div className="space-y-4">
                {events.map((ev) => (
                  <>
                    <div
                      key={ev._id}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-bold text-lg">{ev.hospitalName}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(ev.date).toLocaleString()} •{" "}
                          {ev.durationHours} hrs
                        </p>
                      </div>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            ev.status === "open"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {ev.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    {ev.status === "accepted" && (
                      <div className="mt-2 bg-blue-50 p-3 rounded text-sm text-blue-800">
                        <strong>Helper Assigned!</strong>
                        <br />
                        {/* Note: We will fetch the helper's actual phone in a real scenario, 
          but for now we'll just show a placeholder text */}
                        The helper will contact you shortly. You can also check
                        your app for updates.
                      </div>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ev.status === "open"
                          ? "bg-green-100 text-green-800"
                          : ev.status === "pending_payment"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {ev.status.replace("_", " ").toUpperCase()}
                    </span>
                  </>
                ))}
              </div>
            )}
          </>
        ) : (
          <HelperDashboard />
        )}
      </div>
    </div>
  );
}
