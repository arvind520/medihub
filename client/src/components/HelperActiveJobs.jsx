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
    <div>
      <div className="workspace-section-heading mt-0">
        <h3>Your active jobs</h3>
        <p>Stay up to date with the visits you’re supporting.</p>
      </div>
      <div className="space-y-4">
        {activeJobs.map((job) => (
          <div
            key={job._id}
            className="job-card"
          >
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <h4>{job.hospitalName}</h4>
                <p className="job-meta">
                  {new Date(job.date).toLocaleString()} • {job.durationHours}{" "}
                  hrs
                </p>
                <div className="tag-list mb-3">
                  {job.requirements.map((req) => (
                    <span key={req}>
                      {req}
                    </span>
                  ))}
                </div>
                <div className="info-panel">
                  <strong>Patient Contact:</strong> {job.patientPhone || "N/A"}
                </div>
              </div>
              <button
                onClick={() => handleComplete(job._id)}
                className="app-primary-button"
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
