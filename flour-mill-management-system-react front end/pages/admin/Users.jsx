import React from 'react';
import ErrorBanner from '../../components/ErrorBanner';
import apiFetch from '../../utils/apiFetch';
import { useAuth } from '../../context/AuthProvider';

const Users = () => {
  const { user: currentUser } = useAuth();
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState('user');

  // Filter available roles - admins cannot create other admins
  const availableRoles = React.useMemo(() => {
    const allRoles = [
      { value: 'operator', label: 'Operator' },
      { value: 'manager', label: 'Manager' },
      { value: 'admin', label: 'Admin' }
    ];
    
    // If current user is admin, filter out admin option
    if (currentUser?.role === 'admin') {
      return allRoles.filter(r => r.value !== 'admin');
    }
    
    return allRoles;
  }, [currentUser]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API}/auth/users`);
      const data = await res.json();
      if (res.ok) { setList(data); setError(''); }
      else { setError(data.message || 'Failed to load users'); }
    } catch (e) {
      setError('Failed to load users');
    } finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await apiFetch(`${API}/auth/create-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ User created successfully!');
        setName(''); setEmail(''); setPassword(''); setRole('user');
        await load();
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (e) {
      setError('Server error while creating user');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-sm font-semibold mb-3">Create User</h2>
        {currentUser?.role === 'admin' && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> For security reasons, admins cannot create other admin users. You can only create Manager and Operator roles.
            </p>
          </div>
        )}
        <ErrorBanner message={error} onClose={() => setError('')} />
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs text-slate-600">Name</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} required className="mt-1 w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-600">Email</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="mt-1 w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-600">Password</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="mt-1 w-full border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-600">Role</label>
            <select value={role} onChange={(e)=>setRole(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 text-sm">
              {availableRoles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button type="submit" disabled={saving} className="px-4 py-2 rounded text-white bg-primary hover:bg-blue-800 text-sm">
              {saving ? 'Saving...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">All Users</h2>
          <button onClick={load} className="px-3 py-1.5 rounded text-white bg-primary text-sm">{loading ? 'Loading...' : 'Refresh'}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {list.length === 0 ? (
                <tr><td colSpan="4" className="px-4 py-6 text-center text-slate-500">No users</td></tr>
              ) : list.map(u => (
                <tr key={u._id}>
                  <td className="px-4 py-2 text-sm">{u.name}</td>
                  <td className="px-4 py-2 text-sm">{u.email}</td>
                  <td className="px-4 py-2 text-sm capitalize">{u.role}</td>
                  <td className="px-4 py-2 text-sm">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
