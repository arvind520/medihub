/**
 * FILE: client/src/pages/Dashboard.jsx
 * PURPOSE: Main screen for Patients. Shows their events and a form to create new ones.
 */
import { useState, useEffect } from "react";
import { useUser, useAuth, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import CreateEventForm from "../components/CreateEventForm";

export default function Dashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyEvents = async () => {
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:5000/api/events/mine", {
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

  // Fetch events on load
  useEffect(() => {
    fetchMyEvents();
  }, []);

  // Called when CreateEventForm submits successfully
  const handleEventCreated = (newEvent) => {
    setEvents([newEvent, ...events]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Navbar */}
      <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-sky-700">MediHelp (Patient)</h1>
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

      <div className="max-w-4xl mx-auto p-4 mt-8">
        <h2 className="text-2xl font-semibold mb-6">
          Welcome, {user?.firstName || "Patient"}!
        </h2>

        {/* The Form */}
        <CreateEventForm onEventCreated={handleEventCreated} />

        {/* The List */}
        <h3 className="text-xl font-bold mb-4">Your Requests</h3>
        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500 bg-white p-6 rounded-lg shadow-sm text-center">
            No requests yet.
          </p>
        ) : (
          <div className="space-y-4">
            {events.map((ev) => (
              <div
                key={ev._id}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold text-lg">{ev.hospitalName}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(ev.date).toLocaleString()} • {ev.durationHours}{" "}
                    hrs
                  </p>
                  <div className="flex gap-2 mt-2">
                    {ev.requirements.map((req) => (
                      <span
                        key={req}
                        className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded capitalize"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      ev.status === "open"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ev.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
