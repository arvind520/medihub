/**
 * FILE: client/src/App.jsx
 * PURPOSE: Sets up React Router.
 *          Includes a `ProtectedRoute` component that forces
 *          the user to sign in before viewing certain pages.
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import RoleSelect from "./pages/RoleSelect";

// A wrapper for routes that require login
function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();

  // Wait for Clerk to load to avoid flashing the login screen
  if (!isLoaded) return <div className="p-8 text-center">Loading...</div>;

  // If not signed in, redirect to home
  if (!isSignedIn) return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/select-role"
          element={
            <ProtectedRoute>
              <RoleSelect />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
