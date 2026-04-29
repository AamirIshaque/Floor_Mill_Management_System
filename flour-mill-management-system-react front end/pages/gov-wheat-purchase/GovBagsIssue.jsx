import React, { useState, useEffect, useCallback } from 'react';
import PageShell from '../../components/PageShell';
import apiFetch from '../../utils/apiFetch';
import { API_BASE_URL } from '../../utils/apiConfig';


const GovBagsIssue = () => {
  const API = API_BASE_URL;
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [prCenters, setPrCenters] = useState([]);
  const [prCenter, setPrCenter] = useState('');
  const [bagType, setBagType] = useState('100kg Jute Bag (Govt)');
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState([]);

  const loadRecentIssues = useCallback(async () => {
    try {
      const res = await apiFetch(`${API}/gov-wheat/bags-issues`);
      const data = await res.json();
      if (res.ok) {
        const list = Array.isArray(data) ? data : [];
        setRecent(list.slice(0, 5));
      }
    } catch (e) {
      console.error('Failed to load recent issues:', e);
    }
  }, [API]);

  // Load recent issues
  useEffect(() => {
    loadRecentIssues();
  }, [loadRecentIssues]);

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        loadRecentIssues();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadRecentIssues]);

  // Load PR centers
  useEffect(() => {
    let cancelled = false;
    const loadCenters = async () => {
      try {
        const res = await apiFetch(`${API}/gov-wheat/pr-centers`);
        if (!cancelled) {
          if (res.ok) {
            const data = await res.json();
            setPrCenters(Array.isArray(data) ? data : []);
            if (!prCenter && Array.isArray(data) && data.length > 0) {
              setPrCenter(data[0]._id);
            }
          }
        }
      } catch (e) {
        if (!cancelled) {
          // Failed to load PR centers
        }
      } finally {
        if (!cancelled) {
          // Removed setLoadingCenters call
        }
      }
    };
    loadCenters();
    return () => { cancelled = true; };
  }, [API, prCenter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!prCenter) {
      setError('Please select a PR center before saving.');
      setSaving(false);
      return;
    }

    const payload = {
      issueDate,
      prCenter,
      bagType,
      quantity: Number(quantity) || 0,
      remarks
    };

    try {
      const res = await apiFetch(`${API}/gov-wheat/bags-issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        alert('✅ Bags issued to PR Center successfully!');

        // Reset form
        setQuantity('');
        setRemarks('');
        setError('');

        // Refresh recent issues
        try {
          await loadRecentIssues();
        } catch (e) {
          // Already logged inside loadRecentIssues
        }
      } else {
        const msg = data.message || 'Failed to issue bags';
        setError(msg);
        alert('❌ Failed: ' + msg);
      }
    } catch (err) {
      console.error('Error issuing bags:', err);
      setError('Server error while issuing bags');
      alert('Server error while issuing bags');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="Bags Issue to PR Center">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-slate-50 p-8 rounded-lg border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                            <label htmlFor="voucherNo" className="block text-sm font-medium text-slate-700">Voucher No.</label>
                            <input
                type="text"
                id="voucherNo"
                value="Auto-generated"
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                disabled />

                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="issueDate" className="block text-sm font-medium text-slate-700">Issue Date</label>
                            <input
                type="date"
                id="issueDate"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required />

                        </div>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label htmlFor="prCenter" className="block text-sm font-medium text-slate-700">PR Center</label>
                            <select
                id="prCenter"
                value={prCenter}
                onChange={(e) => setPrCenter(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                disabled={prCenters.length === 0}>

                                {!prCenters.length && <option>No PR centers available</option>}
                                {prCenters.map((c) => <option key={c._id} value={c._id}>{c.centerName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="bagType" className="block text-sm font-medium text-slate-700">Bag Type</label>
                            <select
                id="bagType"
                value={bagType}
                onChange={(e) => setBagType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">

                                <option>100kg Jute Bag (Govt)</option>
                                <option>50kg Jute Bag (Govt)</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">Quantity of Bags (Pcs)</label>
                            <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., 1000"
                required />

                        </div>
                    </div>

                    <div>
                        <label htmlFor="remarks" className="block text-sm font-medium text-slate-700">Remarks</label>
                        <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Optional: any notes about this issuance">
            </textarea>
                    </div>

            <div className="flex justify-end pt-4 border-t mt-6">
                        <button type="button" className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Cancel
                        </button>
                        <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Issue'}
                        </button>
                    </div>
          </form>
        </div>

        <div className="bg-white border rounded-md p-4">
          <h4 className="text-sm font-semibold mb-2">Recent Bags Issues</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Voucher No.</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">PR Center</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Bag Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Remarks</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Quantity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {recent.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-4 text-slate-500">No bags issues yet</td></tr>
                ) : recent.map((r) => (
                  <tr key={r._id}>
                    <td className="px-4 py-2 text-sm">{new Date(r.issueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-sm">{r.voucherNo || '-'}</td>
                    <td className="px-4 py-2 text-sm">{r.prCenter?.centerName || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm">{r.bagType || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm max-w-xs truncate">{r.remarks || '-'}</td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.status === 'Returned' || r.status === 'Received'
                            ? 'bg-green-100 text-green-800'
                            : r.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {r.status || 'Issued'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-right">{r.quantity || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  );

};

export default GovBagsIssue;