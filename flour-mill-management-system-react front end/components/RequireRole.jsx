import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const RequireRole = ({ roles, role, children }) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/auth/login" state={{ from: location }} replace />;
  
  const have = String(user.role || '').toLowerCase();
  const allowedRoles = Array.isArray(roles) ? roles : (role ? [role] : []);
  const hasPermission = allowedRoles.some(r => String(r).toLowerCase() === have);
  
  if (!hasPermission) return <Navigate to="/dashboard" replace />;
  return children;
};

export default RequireRole;
