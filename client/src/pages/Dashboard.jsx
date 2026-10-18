/**
 * FILE: client/src/pages/Dashboard.jsx
 * PURPOSE: A protected page. Only visible if logged in.
 *          For now, it just shows the user's Clerk ID so we can
 *          verify everything works before adding DB roles.
 */
import { useUser, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useUser();

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
    </div>
  );
}
