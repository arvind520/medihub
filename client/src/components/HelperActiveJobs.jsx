/**
 * FILE: client/src/components/HelperActiveJobs.jsx
 * PURPOSE: Shows jobs the helper has accepted but not yet completed.
 */
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

export default function HelperActiveJobs() {
  const { getToken } = useAuth();
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveJobs = async () => {
    try {
      const token = await getToken();
      // We'll add this route to the backend in a moment
      const res = await fetch(
        "http://localhost:5000/api/events/helper/active",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.success) setActiveJobs(data.events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch active jobs when component loads
  useEffect(() => {
    fetchActiveJobs();
  }, []);

  const handleComplete = async (eventId) => {
    if (!window.confirm("Are you sure you want to mark this job as completed?"))
      return;

    try {
      const token = await getToken();
      const res = await fetch(
        `http://localhost:5000/api/events/${eventId}/complete`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();

      if (res.ok) {
        alert("Job completed successfully!");
        // Remove from list
        setActiveJobs(activeJobs.filter((job) => job._id !== eventId));
      } else {
        console.error("Backend Error:", data);
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading active jobs...</p>;
  if (activeJobs.length === 0) return null; // Don't show anything if no active jobs

  return (
    <div className="mb-10">
      <h3 className="text-xl font-bold mb-4 text-sky-700">Your Active Jobs</h3>
      <div className="space-y-4">
        {activeJobs.map((job) => (
          <div
            key={job._id}
            className="bg-white p-4 rounded-lg shadow-md border-l-4 border-sky-500"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg">{job.hospitalName}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  {new Date(job.date).toLocaleString()} • {job.durationHours}{" "}
                  hrs
                </p>
                <div className="flex gap-2 mb-3">
                  {job.requirements.map((req) => (
                    <span
                      key={req}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => handleComplete(job._id)}
                className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700"
              >
                Mark as Completed
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
