import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — guards admin routes.
 * Non-admin users (or unauthenticated visitors) see the 404 page
 * so they can't even tell the route exists.
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user || !user.is_admin) {
    return <Navigate to="/404" replace />;
  }

  return children;
};

export default ProtectedRoute;
