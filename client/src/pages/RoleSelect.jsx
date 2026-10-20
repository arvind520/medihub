/**
 * FILE: client/src/pages/RoleSelect.jsx
 * PURPOSE: First-time screen where user chooses Patient or Helper.
 */
import { useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Welcome, {user?.firstName}!</h1>
        <p className="text-gray-500 mb-8">How do you want to use MediHelp?</p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleSelect("patient")}
            disabled={loading}
            className="border-2 border-sky-500 text-sky-700 p-4 rounded-lg hover:bg-sky-50 transition"
          >
            <h2 className="font-bold text-lg">I need help</h2>
            <p className="text-sm">I am a Patient</p>
          </button>

          <button
            onClick={() => handleSelect("helper")}
            disabled={loading}
            className="border-2 border-green-500 text-green-700 p-4 rounded-lg hover:bg-green-50 transition"
          >
            <h2 className="font-bold text-lg">I want to earn</h2>
            <p className="text-sm">I am a Helper / Assistant</p>
          </button>
        </div>
      </div>
    </div>
  );
}
