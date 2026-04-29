import React, { useEffect, useState, useMemo } from 'react';
import PageShell from '../../components/PageShell';
import apiFetch from '../../utils/apiFetch';
import { useSharedData } from '../../context/DataProvider';


const GovBagsReceive = () => {
  const { suppliers } = useSharedData();
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const [voucherNo, setVoucherNo] = useState('');
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [prCenter, setPrCenter] = useState('');
  const [prCenterName, setPrCenterName] = useState('');
  const [supplier, setSupplier] = useState('');
  const [purchaseNo, setPurchaseNo] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [bagType, setBagType] = useState('100kg Jute Bag (Govt)');
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState([]);
  const [issues, setIssues] = useState([]);
  const [usedVoucherNos, setUsedVoucherNos] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [purchasesError, setPurchasesError] = useState('');
  const [showPurchaseSuggestions, setShowPurchaseSuggestions] = useState(false);

  // Load suppliers default
  useEffect(() => {
    if (suppliers.length > 0 && !supplier) setSupplier(suppliers[0]._id);
  }, [suppliers, supplier]);

  // Load bag issues for voucher selection
  useEffect(() => {
    const loadIssues = async () => {
      try {
        const res = await apiFetch(`${API}/gov-wheat/bags-issues`);
        const data = await res.json();
        if (res.ok) {
          setIssues(data);
        }
      } catch (e) {
        console.error('Failed to load bags issues', e);
      }
    };
    loadIssues();
  }, [API]);

  // Load wheat purchase vouchers for reference suggestions
  useEffect(() => {
    let cancelled = false;
    const loadPurchases = async () => {
      try {
        setLoadingPurchases(true);
        setPurchasesError('');
        const res = await apiFetch(`${API}/gov-wheat/purchases`);
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setPurchases(Array.isArray(data) ? data : []);
        } else {
          setPurchasesError('Failed to load wheat purchases');
        }
      } catch (e) {
        if (!cancelled) {
          setPurchasesError('Failed to load wheat purchases');
        }
      } finally {
        if (!cancelled) {
          setLoadingPurchases(false);
        }
      }
    };
    loadPurchases();
    return () => {
      cancelled = true;
    };
  }, [API]);

  // Load recent receives
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const res = await apiFetch(`${API}/gov-wheat/bags-receives`);
        const data = await res.json();
        if (res.ok) {
          const list = Array.isArray(data) ? data : [];
          setRecent(list.slice(0, 5));
          setUsedVoucherNos(list
            .map((entry) => entry.voucherNo)
            .filter((v) => typeof v === 'string' && v.trim().length > 0));
        }
      } catch (e) {
        console.error('Failed to load recent bags receive entries', e);
      }
    };
    loadRecent();
  }, [API]);

  const usedVoucherSet = useMemo(() => new Set(usedVoucherNos), [usedVoucherNos]);
  const availableIssues = useMemo(
    () => issues.filter((issue) => issue?.voucherNo && !usedVoucherSet.has(issue.voucherNo)),
    [issues, usedVoucherSet]
  );

  const relevantPurchases = useMemo(() => {
    if (!purchases.length) return [];
    if (!prCenter) return purchases;
    return purchases.filter((purchase) => {
      const center = purchase.prCenter;
      const centerId = typeof center === 'string' ? center : center?._id;
      return centerId === prCenter;
    });
  }, [purchases, prCenter]);

  useEffect(() => {
    if (voucherNo && usedVoucherSet.has(voucherNo)) {
      setVoucherNo('');
    }
  }, [voucherNo, usedVoucherSet]);

  // When voucher changes, pull required info from loaded issues
  useEffect(() => {
    if (!voucherNo) {
      setPrCenter('');
      setPrCenterName('');
      setBagType('100kg Jute Bag (Govt)');
      setQuantity('');
      return;
    }

    const issue = issues.find((i) => i.voucherNo === voucherNo);
    if (issue) {
      setPrCenter(issue.prCenter?._id || issue.prCenter || '');
      setPrCenterName(issue.prCenter?.centerName || '');
      setBagType(issue.bagType || '100kg Jute Bag (Govt)');
      setQuantity(String(issue.quantity || ''));
    }
  }, [voucherNo, issues]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!voucherNo) {
      setError('Select a voucher number from bags issue');
      setSaving(false);
      return;
    }

    if (!purchaseNo.trim()) {
      setError('Reference Purchase No. is required');
      setShowPurchaseSuggestions(true);
      setSaving(false);
      return;
    }

    if (!vehicleNo.trim()) {
      setError('Vehicle number is required');
      setSaving(false);
      return;
    }

    const payload = {
      voucherNo,
      receiveDate,
      prCenter,
      supplier,
      referencePurchaseNo: purchaseNo,
      vehicleNo,
      bagType,
      quantity: Number(quantity) || 0,
      remarks
    };

    try {
      const res = await apiFetch(`${API}/gov-wheat/bags-receives`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        alert('✅ Bags receipt recorded successfully!');
        setError('');
        setShowPurchaseSuggestions(false);

        // Reset
        setVoucherNo('');
        setPurchaseNo('');
        setVehicleNo('');
        setQuantity('');
        setRemarks('');

        // Refresh issues and recent
        try {
          const [issuesRes, recentRes] = await Promise.all([
            apiFetch(`${API}/gov-wheat/bags-issues`),
            apiFetch(`${API}/gov-wheat/bags-receives`)
          ]);
          if (issuesRes.ok) {
            const issueData = await issuesRes.json();
            setIssues(issueData);
          }
          if (recentRes.ok) {
            const recentData = await recentRes.json();
            const list = Array.isArray(recentData) ? recentData : [];
            setRecent(list.slice(0, 5));
            setUsedVoucherNos(list
              .map((entry) => entry.voucherNo)
              .filter((v) => typeof v === 'string' && v.trim().length > 0));
          }
        } catch (reloadErr) {
          console.error('Failed refreshing data after receipt', reloadErr);
        }
      } else {
        const msg = data.message || 'Failed to record bags receive entry';
        setError(msg);
        if (msg.toLowerCase().includes('purchase')) {
          setShowPurchaseSuggestions(true);
        }
        alert('❌ Failed: ' + msg);
      }
    } catch (err) {
      console.error('Error creating bags receive entry', err);
      setError('Server error while creating bags receive entry');
      alert('Server error while creating bags receive entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="Bags Receive from PR Center (Filled)">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-slate-50 p-8 rounded-lg border border-slate-200">
                    {error && (
                      <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 text-sm">{error}</div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="voucherNo" className="block text-sm font-medium text-slate-700">Voucher No.</label>
                            <select
                id="voucherNo"
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 bg-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                                <option value="">Select voucher from bags issue</option>
                                {availableIssues.map((issue) => (
                                  <option key={issue._id} value={issue.voucherNo}>{issue.voucherNo}</option>
                                ))}
                            </select>

                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="receiveDate" className="block text-sm font-medium text-slate-700">Receive Date</label>
                            <input
                type="date"
                id="receiveDate"
                value={receiveDate}
                onChange={(e) => setReceiveDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required />

                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="prCenter" className="block text-sm font-medium text-slate-700">From PR Center</label>
                            <input
                type="text"
                id="prCenter"
                value={prCenterName}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                placeholder="Auto-filled from voucher" />
                        </div>
                        <div>
                            <label htmlFor="supplier" className="block text-sm font-medium text-slate-700">Delivered By (Supplier)</label>
                            <select
                id="supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                                {suppliers.length === 0 ? (
                                  <option value="">Select supplier</option>
                                ) : (
                                  suppliers.map((s) => (
                                    <option key={s._id} value={s._id}>{s.supplierName}</option>
                                  ))
                                )}
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="purchaseNo" className="block text-sm font-medium text-slate-700">Reference Purchase No.</label>
                            <input
                type="text"
                id="purchaseNo"
                value={purchaseNo}
                onChange={(e) => {
                  setPurchaseNo(e.target.value);
                  if (showPurchaseSuggestions) setShowPurchaseSuggestions(false);
                }}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., GOV-WPO-2024-023"
                required
              />
                            {purchasesError && (
                              <p className="mt-1 text-xs text-red-600">{purchasesError}</p>
                            )}
                            {showPurchaseSuggestions && !loadingPurchases && (
                              <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3">
                                <p className="text-xs font-medium text-slate-600 mb-2">Available Wheat Purchase Vouchers{prCenter ? ' for this PR center' : ''}:</p>
                                {relevantPurchases.length === 0 ? (
                                  <p className="text-xs text-slate-500">No matching purchases found.</p>
                                ) : (
                                  <ul className="space-y-1 max-h-40 overflow-y-auto text-xs">
                                    {relevantPurchases.slice(0, 10).map((purchase) => (
                                      <li key={purchase._id}>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPurchaseNo(purchase.voucherNo || '');
                                            setShowPurchaseSuggestions(false);
                                            setError('');
                                          }}
                                          className="w-full text-left px-2 py-1 rounded hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200"
                                        >
                                          <span className="font-semibold text-slate-700">{purchase.voucherNo}</span>
                                          {purchase.voucherDate && (
                                            <span className="ml-2 text-slate-500">{new Date(purchase.voucherDate).toLocaleDateString()}</span>
                                          )}
                                          {purchase.prCenter?.centerName && (
                                            <span className="ml-2 text-slate-500">{purchase.prCenter.centerName}</span>
                                          )}
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}

                        </div>
                        <div>
                            <label htmlFor="vehicleNo" className="block text-sm font-medium text-slate-700">Vehicle No.</label>
                            <input
                type="text"
                id="vehicleNo"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., LHR-5678"
                required
              />

                        </div>
                        
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="bagType" className="block text-sm font-medium text-slate-700">Bag Type</label>
                            <input
                type="text"
                id="bagType"
                value={bagType}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                placeholder="Auto-filled from voucher" />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">Quantity of Bags Received</label>
                            <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Auto-filled from voucher"
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
              placeholder="Optional: any notes about this receipt">
            </textarea>
                    </div>

                    <div className="flex justify-end pt-4 border-t mt-6">
                        <button type="button" className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Cancel
                        </button>
                        <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Receipt'}
                        </button>
                    </div>
                    </form>
                </div>

                {/* Recent list */}
                <div className="bg-white border rounded-md p-4">
                  <h4 className="text-sm font-semibold mb-2">Recent Bags Receipts</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Voucher No.</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">PR Center</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Reference P.O.</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Vehicle</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Bag Type</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Quantity</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {recent.length === 0 ? (
                          <tr><td colSpan="9" className="text-center py-4 text-slate-500">No bags receipts yet</td></tr>
                        ) : recent.map((r) => (
                          <tr key={r._id}>
                            <td className="px-4 py-2 text-sm">{new Date(r.receiveDate).toLocaleDateString()}</td>
                            <td className="px-4 py-2 text-sm">{r.voucherNo || '-'}</td>
                            <td className="px-4 py-2 text-sm">{r.prCenter?.centerName || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm">{r.supplier?.supplierName || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm">{r.referencePurchaseNo || '-'}</td>
                            <td className="px-4 py-2 text-sm">{r.vehicleNo || '-'}</td>
                            <td className="px-4 py-2 text-sm">{r.bagType || '-'}</td>
                            <td className="px-4 py-2 text-sm text-right">{r.quantity || 0}</td>
                            <td className="px-4 py-2 text-sm max-w-xs truncate">{r.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
            </div>
        </PageShell>);

};

export default GovBagsReceive;