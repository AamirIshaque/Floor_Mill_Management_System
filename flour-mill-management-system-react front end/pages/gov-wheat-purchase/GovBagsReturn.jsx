import React, { useState, useEffect, useMemo } from 'react';
import PageShell from '../../components/PageShell';
import apiFetch from '../../utils/apiFetch';

const GovBagsReturn = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [returnDate, setReturnDate] = useState(new Date().toISOString().slice(0, 10));
  const [prCenters, setPrCenters] = useState([]);
  const [issuedBags, setIssuedBags] = useState([]);
  const [prCenter, setPrCenter] = useState('');
  const [bagType, setBagType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState([]);
  const [centersError, setCentersError] = useState('');
  const [issuesError, setIssuesError] = useState('');
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [loadingIssues, setLoadingIssues] = useState(true);

  // Load recent returns
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const res = await apiFetch(`${API}/gov-wheat/bags-returns`);
        const data = await res.json();
        if (res.ok) setRecent(data.slice(0, 5)); // Show last 5
      } catch (e) {
        console.error('Failed to load recent returns:', e);
        // Don't show error for recent returns failure
      }
    };
    loadRecent();
  }, [API]);

  useEffect(() => {
    let cancelled = false;
    const loadCenters = async () => {
      try {
        setLoadingCenters(true);
        setCentersError('');
        const res = await apiFetch(`${API}/gov-wheat/pr-centers`);
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          setPrCenters(list);
          if (!prCenter && list.length > 0) {
            setPrCenter(list[0]._id);
          }
        } else {
          setCentersError('Failed to load PR centers');
        }
      } catch (e) {
        if (!cancelled) {
          setCentersError('Failed to load PR centers');
        }
      } finally {
        if (!cancelled) {
          setLoadingCenters(false);
        }
      }
    };
    loadCenters();
    return () => {
      cancelled = true;
    };
  }, [API, prCenter]);

  useEffect(() => {
    let cancelled = false;
    const loadIssues = async () => {
      try {
        setLoadingIssues(true);
        setIssuesError('');
        const res = await apiFetch(`${API}/gov-wheat/bags-issues`);
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          const onlyIssued = list.filter((issue) => (issue?.status || 'Issued') === 'Issued');
          setIssuedBags(onlyIssued);
        } else {
          setIssuesError('Failed to load issued bags');
        }
      } catch (e) {
        if (!cancelled) {
          setIssuesError('Failed to load issued bags');
        }
      } finally {
        if (!cancelled) {
          setLoadingIssues(false);
        }
      }
    };
    loadIssues();
    return () => {
      cancelled = true;
    };
  }, [API]);

  const availableCenters = useMemo(() => {
    if (!prCenters.length || !issuedBags.length) return [];
    const eligibleCenterIds = new Set(
      issuedBags
        .map((issue) => {
          const center = issue.prCenter;
          return typeof center === 'string' ? center : center?._id;
        })
        .filter(Boolean)
    );
    return prCenters.filter((center) => eligibleCenterIds.has(center._id));
  }, [prCenters, issuedBags]);

  const bagTypeOptions = useMemo(() => {
    if (!prCenter) return [];
    const options = issuedBags
      .filter((issue) => {
        const center = issue.prCenter;
        const centerId = typeof center === 'string' ? center : center?._id;
        return centerId === prCenter;
      })
      .map((issue) => issue.bagType)
      .filter(Boolean);
    return Array.from(new Set(options));
  }, [issuedBags, prCenter]);

  useEffect(() => {
    if (prCenters.length === 0 || issuedBags.length === 0) return;
    if (bagTypeOptions.length > 0) return;
    const centerWithIssuedBags = prCenters.find((center) =>
      issuedBags.some((issue) => {
        const issueCenter = issue.prCenter;
        const issueCenterId = typeof issueCenter === 'string' ? issueCenter : issueCenter?._id;
        return issueCenterId === center._id;
      })
    );
    if (centerWithIssuedBags && centerWithIssuedBags._id !== prCenter) {
      setPrCenter(centerWithIssuedBags._id);
    }
  }, [bagTypeOptions, prCenters, issuedBags, prCenter]);

  useEffect(() => {
    if (bagTypeOptions.length === 0) {
      setBagType('');
      return;
    }
    if (!bagTypeOptions.includes(bagType)) {
      setBagType(bagTypeOptions[0]);
    }
  }, [bagTypeOptions, bagType]);

  useEffect(() => {
    if (availableCenters.length === 0) {
      if (prCenter) {
        setPrCenter('');
      }
      return;
    }

    const isCurrentAvailable = availableCenters.some((center) => center._id === prCenter);
    if (!isCurrentAvailable) {
      setPrCenter(availableCenters[0]._id);
    }
  }, [availableCenters, prCenter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!bagType) {
      setError('No issued bag types available for the selected PR center.');
      setSaving(false);
      return;
    }

    const payload = {
      returnDate,
      prCenter,
      bagType,
      quantity: Number(quantity) || 0,
      remarks
    };

    try {
      const res = await apiFetch(`${API}/gov-wheat/bags-returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        alert('✅ Bags return from PR Center recorded successfully!');

        // Reset form
        setQuantity('');
        setRemarks('');
        setError('');

        // Refresh recent returns
        try {
          const recentRes = await apiFetch(`${API}/gov-wheat/bags-returns`);
          if (recentRes.ok) {
            const recentData = await recentRes.json();
            setRecent(recentData.slice(0, 5));
          }
        } catch (e) {
          console.error('Failed to refresh recent returns:', e);
        }
      } else {
        const msg = data.message || 'Failed to record return';
        setError(msg);
        alert('❌ Failed: ' + msg);
      }
    } catch (err) {
      console.error('Error recording return:', err);
      setError('Server error while recording return');
      alert('Server error while recording return');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="Bags Return from PR Center">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-slate-50 p-8 rounded-lg border border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                    {(error || centersError || issuesError) && (
                      <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 space-y-1">
                        {error && <p>{error}</p>}
                        {centersError && <p>{centersError}</p>}
                        {issuesError && <p>{issuesError}</p>}
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
                             <label htmlFor="returnDate" className="block text-sm font-medium text-slate-700">Return Date</label>
                            <input
                type="date"
                id="returnDate"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required />

                        </div>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className='md:col-span-1'>
                            <label htmlFor="prCenter" className="block text-sm font-medium text-slate-700">From PR Center</label>
                            <select
                id="prCenter"
                value={prCenter}
                onChange={(e) => setPrCenter(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                disabled={loadingCenters || availableCenters.length === 0}>

                                {loadingCenters && <option>Loading PR centers...</option>}
                                {!loadingCenters && availableCenters.length === 0 && <option>No issued bags available</option>}
                                {!loadingCenters && availableCenters.map((c) => <option key={c._id} value={c._id}>{c.centerName}</option>)}
                            </select>
                            {availableCenters.length === 0 && !loadingCenters && (
                              <p className="mt-1 text-xs text-slate-500">Issue vouchers must exist before recording a return.</p>
                            )}
                        </div>
                         <div>
                            <label htmlFor="bagType" className="block text-sm font-medium text-slate-700">Bag Type</label>
                            <select
                id="bagType"
                value={bagType || ''}
                onChange={(e) => setBagType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                disabled={bagTypeOptions.length === 0}>

                                {bagTypeOptions.length === 0 ? (
                                  <option value="">No issued bags available</option>
                                ) : (
                                  bagTypeOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                  ))
                                )}
                            </select>
                            {bagTypeOptions.length === 0 && !loadingIssues && (
                              <p className="mt-1 text-xs text-slate-500">No bags have been issued for the selected PR center.</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">Quantity Returned (Pcs)</label>
                            <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., 150"
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
              placeholder="Optional: notes on returned bags condition, etc.">
            </textarea>
                    </div>

                    <div className="flex justify-end pt-4 border-t mt-6">
                        <button type="button" className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Cancel
                        </button>
                        <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60" disabled={saving || bagTypeOptions.length === 0}>
                            {saving ? 'Saving...' : 'Save Return'}
                        </button>
                    </div>
                    </form>
                </div>

                {/* Recent list */}
                <div className="bg-white border rounded-md p-4">
                  <h4 className="text-sm font-semibold mb-2">Recent Bags Returns</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Voucher No.</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">PR Center</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Bag Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Remarks</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {recent.length === 0 ? (
                          <tr><td colSpan="6" className="text-center py-4 text-slate-500">No bags returns yet</td></tr>
                        ) : recent.map((r) => (
                          <tr key={r._id}>
                            <td className="px-4 py-2 text-sm">{new Date(r.returnDate).toLocaleDateString()}</td>
                            <td className="px-4 py-2 text-sm">{r.voucherNo || '-'}</td>
                            <td className="px-4 py-2 text-sm">{r.prCenter?.centerName || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm">{r.bagType || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm max-w-xs truncate">{r.remarks || '-'}</td>
                            <td className="px-4 py-2 text-sm text-right">{r.quantity || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
            </div>
        </PageShell>);

};

export default GovBagsReturn;