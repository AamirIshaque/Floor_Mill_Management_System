import React, { useState } from 'react';
import PageShell from '../../components/PageShell';
import apiFetch from '../../utils/apiFetch';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setOk(''); setLoading(true);
    if (newPassword !== confirmNewPassword) {
      setLoading(false); return alert("New passwords don't match!");
    }
    if (!currentPassword || !newPassword) {
      setLoading(false); return alert("Please fill all fields.");
    }
    try {
      const res = await apiFetch(`${API}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setOk('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setError('Server error while changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Change Password">
            <div className="max-w-lg mx-auto bg-slate-50 p-8 rounded-lg border border-slate-200">
                {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
                {ok && <div className="mb-4 text-green-700 text-sm">{ok}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700">Current Password</label>
                        <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              required />

                    </div>
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">New Password</label>
                        <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              required />

                    </div>
                    <div>
                        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                        <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              required />

                    </div>
                    <div className="flex justify-end pt-4 border-t">
                        <button type="submit" disabled={loading} className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </PageShell>);

};

export default ChangePassword;