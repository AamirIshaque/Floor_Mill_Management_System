import React, { useEffect, useState } from 'react';
import PageShell from '../../components/PageShell';
import apiFetch from '../../utils/apiFetch';

const CenterInformation = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [centerName, setCenterName] = useState('');
  const [centerCode, setCenterCode] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState('');

  const loadCenters = async () => {
    try {
      setLoading(true);
      setError('');
      setNotice('');
      const res = await apiFetch(`${API}/gov-wheat/pr-centers`);
      if (res.ok) {
        const data = await res.json();
        setCenters(Array.isArray(data) ? data : []);
      } else {
        setError('Failed to load PR centers.');
      }
    } catch (e) {
      setError('Failed to load PR centers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCenters(); }, [API]);

  const resetForm = () => {
    setCenterName('');
    setCenterCode('');
    setContactPerson('');
    setPhone('');
    setAddress('');
    setCapacity('');
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    const payload = {
      centerCode,
      centerName,
      contactPerson,
      phoneNumber: phone,
      storageCapacity: capacity ? Number(capacity) : undefined,
      location: address,
    };

    try {
      const endpoint = editingId ? `${API}/gov-wheat/pr-centers/${editingId}` : `${API}/gov-wheat/pr-centers`;
      const res = await apiFetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        resetForm();
        if (editingId) {
          setCenters((prev) => prev.map((center) => center._id === data._id ? data : center));
          setNotice('PR center updated successfully.');
        } else {
          setCenters((prev) => [data, ...prev]);
          setNotice('PR center added successfully.');
        }
      } else {
        setError(data?.message || 'Failed to save PR center.');
      }
    } catch (err) {
      setError('Server error while saving PR center.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (center) => {
    setNotice('');
    setError('');
    setEditingId(center._id);
    setCenterCode(center.centerCode || '');
    setCenterName(center.centerName || '');
    setContactPerson(center.contactPerson || '');
    setPhone(center.phoneNumber || '');
    setAddress(center.location || '');
    setCapacity(center.storageCapacity != null ? String(center.storageCapacity) : '');
  };

  const handleDelete = async (centerId) => {
    const toDelete = centers.find((c) => c._id === centerId);
    if (!toDelete) return;
    if (!window.confirm(`Delete PR center "${toDelete.centerName}"? This cannot be undone.`)) return;

    setDeletingId(centerId);
    setError('');
    setNotice('');
    try {
      const res = await apiFetch(`${API}/gov-wheat/pr-centers/${centerId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        setCenters((prev) => prev.filter((center) => center._id !== centerId));
        if (editingId === centerId) {
          resetForm();
        }
        setNotice(data?.message || 'PR center deleted successfully.');
      } else {
        setError(data?.message || 'Failed to delete PR center.');
      }
    } catch (err) {
      setError('Server error while deleting PR center.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageShell title="PR Center Information Management">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Form Section */}
                <div className="md:col-span-1 bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <h4 className="text-lg font-semibold text-slate-800 mb-4">Add New PR Center</h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                            {error}
                          </div>
                        )}
                        {notice && (
                          <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                            {notice}
                          </div>
                        )}
                        <div>
                            <label htmlFor="centerCode" className="block text-sm font-medium text-slate-700">Center Code</label>
                            <input
                type="text"
                id="centerCode"
                value={centerCode}
                onChange={(e) => setCenterCode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., PRC-MUL-01"
                required />

                        </div>
                        <div>
                            <label htmlFor="centerName" className="block text-sm font-medium text-slate-700">Center Name</label>
                            <input
                type="text"
                id="centerName"
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., Multan PR Center"
                required />

                        </div>
                        <div>
                            <label htmlFor="contactPerson" className="block text-sm font-medium text-slate-700">Contact Person</label>
                            <input
                type="text"
                id="contactPerson"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />

                        </div>
                         <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone Number</label>
                            <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />

                        </div>
                         <div>
                            <label htmlFor="capacity" className="block text-sm font-medium text-slate-700">Storage Capacity (Tons)</label>
                            <input
                type="number"
                id="capacity"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., 5000" />

                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-slate-700">Address / Location</label>
                            <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
              </textarea>
                        </div>
                        <div>
                            <button type="submit" disabled={saving} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed">
                                {saving ? (editingId ? 'Updating...' : 'Saving...') : (editingId ? 'Update Center' : 'Save Center')}
                            </button>
                            {editingId && (
                              <button type="button" onClick={resetForm} className="mt-2 w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-600 hover:bg-slate-100">
                                Cancel Editing
                              </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Table Section */}
                <div className="md:col-span-2">
                     <div className="overflow-x-auto bg-white rounded-lg shadow">
                        {loading ? (
                          <div className="p-6 text-center text-slate-500 text-sm">Loading PR centers...</div>
                        ) : centers.length === 0 ? (
                          <div className="p-6 text-center text-slate-500 text-sm">No PR centers yet.</div>
                        ) : (
                          <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact Person</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Capacity</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Address</th>
                                <th scope="col" className="relative px-6 py-3">
                                  <span className="sr-only">Edit</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                              {centers.map((center) => (
                                <tr key={center._id} className="hover:bg-slate-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{center.centerCode}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{center.centerName}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{center.contactPerson || '-'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{center.phoneNumber || '-'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{center.storageCapacity ? `${center.storageCapacity} Tons` : '-'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{center.location || '-'}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-3">
                                      <button type="button" onClick={() => handleEdit(center)} className="text-primary hover:text-blue-800">Edit</button>
                                      <button type="button" onClick={() => handleDelete(center._id)} className="text-red-500 hover:text-red-700 disabled:opacity-60" disabled={deletingId === center._id}>
                                        {deletingId === center._id ? 'Deleting...' : 'Delete'}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                </div>
            </div>
        </PageShell>);

};

export default CenterInformation;