import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = document.cookie.includes("Authorization");
  if (!token) return <Navigate to="/signin" replace />;
  return children;
}
