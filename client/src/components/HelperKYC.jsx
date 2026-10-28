/**
 * FILE: client/src/components/HelperKYC.jsx
 * PURPOSE: Form for helpers to submit ID for approval.
 */
import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";

export default function HelperKYC({ userData, onRefresh }) {
  const { getToken } = useAuth();
  const [document, setDocument] = useState("");
  const [loading, setLoading] = useState(false);

  const submitKYC = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:5000/api/users/kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ kycDocument: document }),
      });
      if (res.ok) {
        alert("KYC submitted! Waiting for Admin approval.");
        onRefresh(); // Refresh the dashboard state
      }
    } catch (err) {
      alert("Error submitting KYC: ", err);
    } finally {
      setLoading(false);
    }
  };

  // If submitted and pending, show waiting screen
  if (userData.kycStatus === "pending") {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg text-center shadow-sm">
        <h3 className="text-xl font-bold text-yellow-700 mb-2">
          Verification Pending
        </h3>
        <p className="text-yellow-600">
          Your KYC is under review by an Admin. You cannot accept jobs yet.
        </p>
      </div>
    );
  }

  // If not submitted, show form
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Complete your KYC</h2>
      <p className="text-sm text-gray-600 mb-4">
        To start earning, please provide your Aadhaar or ID number.
      </p>
      <form onSubmit={submitKYC}>
        <input
          type="text"
          required
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          placeholder="Enter Aadhaar / ID Number"
          className="w-full border rounded p-2 mb-4"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit for Review"}
        </button>
      </form>
    </div>
  );
}
