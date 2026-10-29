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
    return (
      <div className="loading-screen" role="status">
        <span className="brand-mark" aria-hidden="true">+</span>
        <p>Getting your care space ready</p>
      </div>
    );

  return (
    <div className="workspace-shell">
      {/* Navbar */}
      <nav className="workspace-nav">
        <Link to="/" className="brand-lockup workspace-brand" aria-label="MediHelp home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path
                d="M16 26s-9-5.7-9-12.1A5 5 0 0 1 16 10a5 5 0 0 1 9 3.9C25 20.3 16 26 16 26Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M16 12v8m-4-4h8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>MediHelp</span>
          <span className="workspace-role-label">
            {role === "patient" ? "Patient" : role === "admin" ? "Admin" : "Helper"}
          </span>
          {role === "helper" && (
            <span className="rating-badge">
              ★ {userData?.avgRating || "New"}
            </span>
          )}
        </Link>
        <div className="workspace-nav-actions">
          <Link
            to="/select-role"
            className="switch-role"
          >
            Switch Role
          </Link>
          <UserButton />
        </div>
      </nav>

      <main className="workspace-main">
        <div className="workspace-welcome">
          <span className="section-kicker">Your MediHelp space</span>
          <h2>Welcome, {user?.firstName || "there"}.</h2>
          <p>
            {role === "patient"
              ? "Arrange a little extra support for your next hospital visit."
              : role === "helper"
                ? "Your care and time can make someone’s day easier."
                : "Review and support the MediHelp community."}
          </p>
        </div>

        {role === "patient" ? (
          <>
            <CreateEventForm onEventCreated={handleEventCreated} />
            <div className="workspace-section-heading">
              <h3>Your requests</h3>
              <p>Keep track of the support you’ve arranged.</p>
            </div>
            {events.length === 0 ? (
              <div className="empty-state">
                No requests yet. Your new request will appear here.
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((ev) => (
                  <div
                    key={ev._id}
                    className="request-card"
                  >
                    {/* Top Row: Title and Status */}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4>{ev.hospitalName}</h4>
                        <p className="job-meta">
                          {new Date(ev.date).toLocaleString()} •{" "}
                          {ev.durationHours} hrs
                        </p>
                      </div>
                      <span
                        className={`status-pill ${
                          ev.status === "open"
                            ? "status-open"
                            : ev.status === "pending_payment"
                              ? "status-pending"
                              : ev.status === "completed"
                                ? "status-complete"
                                : "status-active"
                        }`}
                      >
                        {ev.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    {/* Helper Assigned Block */}
                    {ev.status === "accepted" && (
                      <div className="info-panel mt-3 flex flex-wrap items-center justify-between gap-3">
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
                          className="app-danger-button"
                        >
                          Cancel & Refund
                        </button>
                        {ev.helperPhone && (
                          <a
                            href={`tel:${ev.helperPhone}`}
                            className="app-primary-button"
                          >
                            Call Helper
                          </a>
                        )}
                      </div>
                    )}

                    {/* Completed Block */}
                    {ev.status === "completed" && (
                      <div className="info-panel mt-3 flex flex-wrap items-center justify-between gap-3">
                        <span>Job Completed</span>
                        {!reviewedEvents.includes(ev._id) && (
                          <button
                            onClick={() => setReviewEvent(ev)}
                            className="app-secondary-button"
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
      </main>

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
