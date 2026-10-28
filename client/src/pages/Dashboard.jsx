/**
 * FILE: client/src/pages/Dashboard.jsx
 * PURPOSE: Acts as a router. Checks the user's role from the DB
 *          and renders the Patient or Helper view accordingly.
 */
import { useState, useEffect } from "react";
import { useUser, useAuth, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import useSocket from "../hooks/useSocket";
import CreateEventForm from "../components/CreateEventForm";
import HelperDashboard from "../components/HelperDashboard";
import ReviewModal from "../components/ReviewModal";
import HelperKYC from "../components/HelperKYC";
import AdminDashboard from "../components/AdminDashboard";

export default function Dashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewEvent, setReviewEvent] = useState(null);
  const [reviewedEvents, setReviewedEvents] = useState([]);
  const socket = useSocket();

  const initializeDashboard = async () => {
    try {
      const token = await getToken();
      const userRes = await fetch("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await userRes.json();

      setUserData(data.user || null);
      setRole(data.user?.role || "patient");

      if (data.user?.role === "patient") {
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

  useEffect(() => {
    if (!socket) return;

    socket.on("event:accepted", (data) => {
      alert("🔔 " + data.message);
      setEvents((prevEvents) =>
        prevEvents.map((ev) => (ev._id === data.event._id ? data.event : ev)),
      );
    });

    socket.on("event:completed", (data) => {
      alert("✅ " + data.message);
      setEvents((prevEvents) =>
        prevEvents.map((ev) => (ev._id === data.event._id ? data.event : ev)),
      );
    });

    socket.on("event:cancelled", (data) => {
      alert("⚠️ " + data.message);
      // If the helper is currently looking at their active jobs, refresh the feed
      window.location.reload();
    });

    return () => {
      socket.off("event:accepted");
      socket.off("event:completed");
      socket.off("event:cancelled");
    };
  }, [socket]);

  const handleEventCreated = (newEvent) => {
    setEvents([newEvent, ...events]);
  };

  if (loading)
    return <div className="p-10 text-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Navbar */}
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-sky-700 flex items-center gap-2">
          MediHelp ({role === "patient" ? "Patient" : "Helper"})
          {role === "helper" && (
            <span className="text-sm font-normal text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
              ★ {userData?.avgRating || "New"}
            </span>
          )}
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
                  <div
                    key={ev._id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                  >
                    {/* Top Row: Title and Status */}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-lg">{ev.hospitalName}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(ev.date).toLocaleString()} •{" "}
                          {ev.durationHours} hrs
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          ev.status === "open"
                            ? "bg-green-100 text-green-800"
                            : ev.status === "pending_payment"
                              ? "bg-yellow-100 text-yellow-800"
                              : ev.status === "completed"
                                ? "bg-gray-200 text-gray-700"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {ev.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    {/* Helper Assigned Block */}
                    {ev.status === "accepted" && (
                      <div className="mt-2 bg-blue-50 p-3 rounded text-sm text-blue-800 flex justify-between items-center">
                        <div>
                          <strong>Helper Assigned!</strong>
                          <br />
                          Phone: {ev.helperPhone || "Loading..."}
                        </div>
                        <button
                          onClick={async () => {
                            if (
                              !window.confirm(
                                "Are you sure? This will refund your money and penalize the helper.",
                              )
                            )
                              return;
                            try {
                              const token = await getToken();
                              const res = await fetch(
                                `http://localhost:5000/api/events/${ev._id}/cancel`,
                                {
                                  method: "POST",
                                  headers: { Authorization: `Bearer ${token}` },
                                },
                              );
                              const data = await res.json();
                              if (res.ok) {
                                alert("✅ Refund initiated successfully.");
                                setEvents(
                                  events.map((e) =>
                                    e._id === ev._id ? data.event : e,
                                  ),
                                );
                              } else {
                                alert(data.error);
                              }
                            } catch (err) {
                              alert("Network error: ", err);
                            }
                          }}
                          className="border border-red-500 text-red-600 px-4 py-2 rounded hover:bg-red-50"
                        >
                          Cancel & Refund
                        </button>
                        {ev.helperPhone && (
                          <a
                            href={`tel:${ev.helperPhone}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          >
                            Call Helper
                          </a>
                        )}
                      </div>
                    )}

                    {/* Completed Block */}
                    {ev.status === "completed" && (
                      <div className="mt-2 bg-gray-50 p-3 rounded text-sm text-gray-700 flex justify-between items-center">
                        <span>Job Completed</span>
                        {!reviewedEvents.includes(ev._id) && (
                          <button
                            onClick={() => setReviewEvent(ev)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                          >
                            ★ Leave Review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : role === "admin" ? (
          <AdminDashboard />
        ) : (
          <>
            {!userData?.isApproved ? (
              <HelperKYC userData={userData} onRefresh={initializeDashboard} />
            ) : (
              <HelperDashboard />
            )}
          </>
        )}
      </div>

      {reviewEvent && (
        <ReviewModal
          event={reviewEvent}
          onClose={() => setReviewEvent(null)}
          onReviewSubmitted={(id) => setReviewedEvents([...reviewedEvents, id])}
        />
      )}
    </div>
  );
}
