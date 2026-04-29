import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiFetch from '../utils/apiFetch';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fetchMe = async () => {
    try {
      // First check if we have a token
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

      if (!token) {
        // No token - user is not authenticated
        console.log('No auth token found - user not authenticated');
        setUser(null);
        setLoading(false);
        setInitialized(true);
        return;
      }

      // We have a token - validate it
      console.log('Validating auth token...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const res = await apiFetch(`${API}/auth/me`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        // Token invalid or expired - clear it
        console.log('Auth token invalid - clearing');
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        setUser(null);
      } else {
        // Token valid - set user data
        console.log('Auth token valid - setting user data');
        const data = await res.json();
        setUser(data);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('Auth check timed out');
      } else {
        console.warn('Auth check failed:', error.message);
      }
      // Clear any invalid tokens
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    // Immediately initialize without any auth checks
    console.log('AuthProvider: Initializing...');
    fetchMe();
  }, []);

  const logout = () => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    setUser(null);
  };

  const value = useMemo(() => ({ user, setUser, loading, logout, refresh: fetchMe }), [user, loading]);

  // Show simple loading for 2 seconds, then proceed
  if (!initialized) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Starting application...</p>
          <p className="text-xs text-slate-400 mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  console.log('AuthProvider: Ready, proceeding to app');
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
