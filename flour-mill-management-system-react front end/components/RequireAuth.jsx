import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const token = typeof window !== 'undefined' ? (sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token')) : null;
  if (!token) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  return children;
};

export default RequireAuth;
