import React, { useState } from 'react';
import PageShell from '../../components/PageShell';
import apiFetch from '../../utils/apiFetch';

const Customers = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API}/sales/customers`);
      const data = await res.json();
      if (res.ok) setCustomers(data);
    } catch (e) {}
    finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { alert('Name is required'); return; }
    setSaving(true);
    try {
      const res = await apiFetch(`${API}/sales/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, address })
      });
      const data = await res.json();
      if (res.ok) {
        setName(''); setPhone(''); setAddress('');
        await load();
      } else {
        alert(data.message || 'Failed to add customer');
      }
    } catch (err) {
      alert('Server error while adding customer');
    } finally { setSaving(false); }
  };

  return (
    <PageShell title="Customers">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h4 className="text-sm font-semibold mb-4">Add Customer</h4>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-600">Name</label>
              <input value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-xs text-slate-600">Phone</label>
              <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-600">Address</label>
              <textarea value={address} onChange={(e)=>setAddress(e.target.value)} rows={2} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={saving} className="px-4 py-2 rounded text-white bg-primary text-sm">
                {saving ? 'Saving...' : 'Save Customer'}
              </button>
            </div>
          </form>
        </div>
        <div className="md:col-span-2">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold">Customers</h4>
              <button onClick={load} className="px-3 py-1.5 rounded text-white bg-primary text-sm">
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Phone</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Address</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {customers.length === 0 ? (
                    <tr><td colSpan="3" className="px-4 py-6 text-center text-slate-500">No customers</td></tr>
                  ) : customers.map(c => (
                    <tr key={c._id}>
                      <td className="px-4 py-2 text-sm">{c.name}</td>
                      <td className="px-4 py-2 text-sm">{c.phone || '-'}</td>
                      <td className="px-4 py-2 text-sm">{c.address || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Customers;
