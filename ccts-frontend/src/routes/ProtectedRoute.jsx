import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated } from "../services/authService";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (isAuthenticated()) {
    return children || <Outlet />;
  }

  // Not authenticated: redirect to login with original location and friendly message
  return (
    <Navigate
      to="/login"
      replace
      state={{
        from: location,
        message: "Please sign in or create an account to register a complaint.",
      }}
    />
  );
}
