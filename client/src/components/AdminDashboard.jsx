/**
 * FILE: client/src/components/AdminDashboard.jsx
 * PURPOSE: Shows pending helpers and allows Admin to approve them.
 */
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

export default function AdminDashboard() {
  const { getToken } = useAuth();
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:5000/api/admin/helpers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setHelpers(data.helpers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (clerkId) => {
    if (!window.confirm("Approve this helper?")) return;
    try {
      const token = await getToken();
      await fetch(`http://localhost:5000/api/admin/approve/${clerkId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Helper Approved!");
      setHelpers(helpers.filter((h) => h.clerkId !== clerkId));
    } catch (err) {
      alert("Error approving helper:", err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="workspace-card admin-card">
      <span className="section-kicker">Community care</span>
      <h2 className="form-title mt-2">Helper verification</h2>
      <p className="form-description">
        Review identity submissions before helpers can accept requests.
      </p>
      {helpers.length === 0 ? (
        <div className="empty-state">No pending verification requests.</div>
      ) : (
        <div className="space-y-4">
          {helpers.map((h) => (
            <div
              key={h.clerkId}
              className="admin-helper-row"
            >
              <div>
                <p className="admin-helper-name">
                  {h.firstName} ({h.email})
                </p>
                <p className="admin-helper-document">
                  KYC Doc: {h.kycDocument}
                </p>
              </div>
              <button
                onClick={() => handleApprove(h.clerkId)}
                className="app-primary-button"
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
