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
      <div className="workspace-card verification-pending text-center">
        <span className="verification-icon" aria-hidden="true">✓</span>
        <h3 className="form-title">
          Verification Pending
        </h3>
        <p className="form-description">
          Your KYC is under review by an Admin. You cannot accept jobs yet.
        </p>
      </div>
    );
  }

  // If not submitted, show form
  return (
    <div className="workspace-card kyc-card">
      <span className="section-kicker">One quick step</span>
      <h2 className="form-title mt-2">Complete your verification</h2>
      <p className="form-description">
        To start earning, please provide your Aadhaar or ID number.
      </p>
      <form className="kyc-form" onSubmit={submitKYC}>
        <input
          type="text"
          required
          value={document}
          onChange={(e) => setDocument(e.target.value)}
          placeholder="Enter Aadhaar / ID Number"
          className="form-control mb-4"
        />
        <button
          type="submit"
          disabled={loading}
          className="app-primary-button w-full"
        >
          {loading ? "Submitting..." : "Submit for Review"}
        </button>
      </form>
    </div>
  );
}
