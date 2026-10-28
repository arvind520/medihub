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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Admin Panel - Pending Helpers</h2>
      {helpers.length === 0 ? (
        <p className="text-gray-500">No pending KYC requests.</p>
      ) : (
        <div className="space-y-4">
          {helpers.map((h) => (
            <div
              key={h.clerkId}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p className="font-bold">
                  {h.firstName} ({h.email})
                </p>
                <p className="text-sm text-gray-600">
                  KYC Doc: {h.kycDocument}
                </p>
              </div>
              <button
                onClick={() => handleApprove(h.clerkId)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
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
