/**
 * FILE: client/src/components/HelperDashboard.jsx
 * PURPOSE: The main view for Helpers. Shows available events and allows accepting.
 */
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import HelperActiveJobs from "./HelperActiveJobs";

export default function HelperDashboard() {
  const { getToken } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchOpenEvents = async () => {
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:5000/api/events/open", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setEvents(data.events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch open events on load
  useEffect(() => {
    fetchOpenEvents();
  }, []);

  const handleAccept = async (eventId) => {
    setAcceptingId(eventId);
    try {
      const token = await getToken();
      const res = await fetch(
        `http://localhost:5000/api/events/${eventId}/accept`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert("Event accepted successfully!");

      // Remove the accepted event from the list
      setEvents(events.filter((ev) => ev._id !== eventId));
    } catch (err) {
      alert(err.message);
      // If it failed (e.g., someone else accepted it), refresh the list
      fetchOpenEvents();
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading)
    return <p className="text-center mt-10">Loading available jobs...</p>;

  return (
    <div className="helper-view">
      <HelperActiveJobs />
      <div>
        <div className="workspace-section-heading mt-0">
          <h3>Available jobs</h3>
          <p>Requests from people looking for a helping hand.</p>
        </div>
        {events.length === 0 ? (
          <div className="empty-state">
            No open requests right now. Check back a little later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => (
              <div
                key={ev._id}
                className="job-card flex flex-col justify-between"
              >
                <div>
                  <h4>{ev.hospitalName}</h4>
                  <p className="job-meta">
                    {new Date(ev.date).toLocaleString()} • {ev.durationHours}{" "}
                    hrs
                  </p>
                  <div className="tag-list mb-4">
                    {ev.requirements.map((req) => (
                      <span key={req}>{req}</span>
                    ))}
                  </div>
                  {ev.notes && (
                    <p className="job-meta italic mb-4">"{ev.notes}"</p>
                  )}
                </div>

                <div className="job-footer">
                  <span className="job-price">₹{ev.amount}</span>
                  <button
                    onClick={() => handleAccept(ev._id)}
                    disabled={acceptingId === ev._id}
                    className="app-primary-button"
                  >
                    {acceptingId === ev._id ? "Accepting..." : "Accept Job"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
