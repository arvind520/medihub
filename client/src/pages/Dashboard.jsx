/**
 * FILE: client/src/pages/Dashboard.jsx
 * PURPOSE: A protected page. Only visible if logged in.
 *          For now, it just shows the user's Clerk ID so we can
 *          verify everything works before adding DB roles.
 */
import { useUser, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";

export default function Dashboard() {
  const { user } = useUser();

  const { getToken } = useAuth();
  const [backendRes, setBackendRes] = useState(null);

  const testBackend = async () => {
    try {
      // 1. Get the JWT token from Clerk
      const token = await getToken();

      // 2. Send it to the backend
      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setBackendRes(data);
    } catch (err) {
      setBackendRes({ error: err.message });
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sky-600 hover:underline">
            Home
          </Link>
          <UserButton />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md max-w-lg">
        <h2 className="text-xl font-semibold mb-2">Welcome!</h2>
        <p className="text-gray-600 mb-4">
          You are authenticated securely via Clerk.
        </p>
        <div className="bg-gray-100 p-4 rounded text-sm font-mono">
          <p>
            <strong>Email:</strong>{" "}
            {user?.primaryEmailAddress?.emailAddress || "No email"}
          </p>
          <p>
            <strong>Clerk ID:</strong> {user?.id}
          </p>
        </div>
      </div>
      <button
        onClick={testBackend}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Test Backend Auth
      </button>

      {backendRes && (
        <pre className="mt-4 bg-gray-800 text-green-400 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(backendRes, null, 2)}
        </pre>
      )}
    </div>
  );
}
