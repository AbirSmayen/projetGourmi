import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const auth = localStorage.getItem("auth");
  if (!auth) return <Navigate to="/login" replace />;

  try {
    const { user } = JSON.parse(auth);
    if (!user || user.role !== "admin") return <Navigate to="/login" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
