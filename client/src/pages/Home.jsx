/**
 * FILE: client/src/pages/Home.jsx
 * PURPOSE: Public landing page. Shows login buttons if logged out,
 *          and a welcome message if logged in.
 */
import { useAuth, SignInButton, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50">
      <h1 className="text-4xl font-bold text-sky-700 mb-4">MediHelp</h1>

      {isSignedIn ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-green-600 font-semibold">You are logged in! ✅</p>
          <UserButton afterSignOutUrl="/" />
          <Link to="/dashboard" className="text-sky-600 underline">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-600">Please sign in to continue.</p>
          <SignInButton mode="modal">
            <button className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700">
              Sign In
            </button>
          </SignInButton>
        </div>
      )}
    </div>
  );
}
