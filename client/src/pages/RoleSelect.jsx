/**
 * FILE: client/src/pages/RoleSelect.jsx
 * PURPOSE: First-time screen where user chooses Patient or Helper.
 */
import { useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";

export default function RoleSelect() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSelect = async (role) => {
    console.log("role", role);
    setLoading(true);
    try {
      const token = await getToken();
      console.log("Token", token);
      const res = await fetch("http://localhost:5000/api/users/role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      console.log("res", res);
      if (!res.ok) throw new Error("Failed to update role");

      // Send them to the dashboard after success
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-page">
      <div className="role-card">
        <Link className="brand-lockup" to="/" aria-label="MediHelp home">
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
        </Link>
        <h1>Welcome, {user?.firstName || "there"}.</h1>
        <p>How would you like to use MediHelp?</p>

        <div className="role-options">
          <button
            onClick={() => handleSelect("patient")}
            disabled={loading}
            className="role-option"
          >
            <span className="role-option-title">
              {loading ? "Saving your choice..." : "I need support"}
            </span>
            <span className="role-option-description">
              I’m arranging help for a hospital visit
            </span>
            <span className="role-option-icon" aria-hidden="true">
              +
            </span>
          </button>

          <button
            onClick={() => handleSelect("helper")}
            disabled={loading}
            className="role-option"
          >
            <span className="role-option-title">
              {loading ? "Saving your choice..." : "I want to be a companion"}
            </span>
            <span className="role-option-description">
              I’d like to support people in my community
            </span>
            <span className="role-option-icon" aria-hidden="true">
              ♥
            </span>
          </button>
        </div>
        <Link className="role-back-link" to="/">
          Back to MediHelp
        </Link>
      </div>
    </div>
  );
}
