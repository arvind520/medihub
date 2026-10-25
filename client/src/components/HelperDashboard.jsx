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

      alert(
        "Event accepted successfully! (In Phase 4, we'll show patient contact info here)",
      );

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
    <div>
      <HelperActiveJobs />
      <h3 className="text-xl font-bold mb-4">Available Jobs</h3>
      {events.length === 0 ? (
        <p className="text-gray-500 bg-white p-6 rounded-lg shadow-sm text-center">
          No open requests right now. Check back later!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((ev) => (
            <div
              key={ev._id}
              className="bg-white p-5 rounded-lg shadow-md border-t-4 border-green-500 flex flex-col justify-between"
            >
              <div>
                <h4 className="font-bold text-lg text-gray-800">
                  {ev.hospitalName}
                </h4>
                <p className="text-sm text-gray-500 mb-3">
                  {new Date(ev.date).toLocaleString()} • {ev.durationHours} hrs
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {ev.requirements.map((req) => (
                    <span
                      key={req}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize"
                    >
                      {req}
                    </span>
                  ))}
                </div>
                {ev.notes && (
                  <p className="text-sm text-gray-600 italic mb-4">
                    "{ev.notes}"
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className="font-bold text-lg text-green-600">
                  ₹{ev.amount}
                </span>
                <button
                  onClick={() => handleAccept(ev._id)}
                  disabled={acceptingId === ev._id}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {acceptingId === ev._id ? "Accepting..." : "Accept Job"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
