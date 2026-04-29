import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBanner from '../../components/ErrorBanner';
import { useAuth } from '../../context/AuthProvider';

const Login = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        sessionStorage.setItem('auth_token', data.token);
        await refresh(); // Load user data immediately
        navigate('/dashboard');
      } else {
        // Handle blocked user message differently
        if (res.status === 403 && data.message.includes('blocked by admin')) {
          setError(data.message);
        } else {
          setError(data.message || 'Invalid credentials');
        }
      }
    } catch (err) {
      setError('Server error while logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1 text-center">Flour Mill Management System</h1>
        <div className="text-sm text-slate-500 mb-4 text-center">Sign in</div>
        <ErrorBanner message={error} onClose={() => setError('')} />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="••••••••" />
          </div>
          <div className="pt-2 flex justify-end">
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-md text-white bg-primary hover:bg-blue-800">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
