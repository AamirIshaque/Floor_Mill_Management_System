import React, { useState, useMemo, useEffect, useCallback } from 'react';
import PageShell from '../../components/PageShell';
import apiFetch from '../../utils/apiFetch';
import { useSharedData } from '../../context/DataProvider';

const GovWheatPurchaseReturn = () => {
  const { suppliers } = useSharedData();
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [returnDate, setReturnDate] = useState(new Date().toISOString().slice(0, 10));
  const [prCenter, setPrCenter] = useState('');
  const [supplier, setSupplier] = useState('');
  const [purchaseInvoiceNo, setPurchaseInvoiceNo] = useState('');
  const [reason, setReason] = useState('');
  const [quantity, setQuantity] = useState('');
  const [rate, setRate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState([]);
  const [prCenters, setPrCenters] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [centersError, setCentersError] = useState('');
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [maxReturnQuantity, setMaxReturnQuantity] = useState(null);
  const [quantityError, setQuantityError] = useState('');
  const [usedReferences, setUsedReferences] = useState([]);

  const isOrderLocked = Boolean(selectedOrderId);

  // Initialize defaults when data loads
  useEffect(() => {
    if (suppliers.length > 0 && !supplier) setSupplier(suppliers[0]._id);
  }, [suppliers, supplier]);

  // Load PR centers
  useEffect(() => {
    let cancelled = false;
    const loadCenters = async () => {
      try {
        setLoadingCenters(true);
        setCentersError('');
        const res = await apiFetch(`${API}/gov-wheat/pr-centers`);
        if (!cancelled) {
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : [];
            setPrCenters(list);
            if (list.length > 0) {
              setPrCenter((prev) => prev || (list[0]?._id || ''));
            }
          } else {
            setCentersError('Failed to load PR centers.');
          }
        }
      } catch (e) {
        if (!cancelled) setCentersError('Failed to load PR centers.');
      } finally {
        if (!cancelled) setLoadingCenters(false);
      }
    };
    loadCenters();
    return () => { cancelled = true; };
  }, [API]);

  const applyOrderToForm = useCallback((order) => {
    if (!order) {
      setPurchaseInvoiceNo('');
      setMaxReturnQuantity(null);
      setQuantity('');
      setQuantityError('');
      setPrCenter('');
      setSupplier('');
      setRate('');
      return;
    }
    setPurchaseInvoiceNo(order.orderNo || order._id);
    if (order.prCenter) {
      const centerId = order.prCenter._id || order.prCenter;
      setPrCenter(centerId || '');
    }
    if (order.supplier) {
      const supplierId = order.supplier._id || order.supplier;
      setSupplier(supplierId || '');
    }
    const firstItem = order.items?.[0];
    const orderRate = firstItem != null ? Number(firstItem.rate ?? firstItem.amount ?? 0) : null;
    if (orderRate != null && !Number.isNaN(orderRate)) {
      setRate(String(orderRate));
    }
    const totalQty = Array.isArray(order.items)
      ? order.items.reduce((sum, item) => sum + (Number(item.quantity ?? item.qty ?? 0) || 0), 0)
      : null;
    setMaxReturnQuantity(totalQty && totalQty > 0 ? Number(totalQty.toFixed(2)) : null);
    setQuantity('');
    setQuantityError('');
  }, []);

  // Load purchase orders for reference list
  useEffect(() => {
    let cancelled = false;
    const loadOrders = async () => {
      try {
        setLoadingOrders(true);
        setOrdersError('');
        const res = await apiFetch(`${API}/gov-wheat/purchase-orders`);
        if (!cancelled) {
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : [];
            setPurchaseOrders(list);
          } else {
            setOrdersError('Failed to load purchase orders.');
          }
        }
      } catch (e) {
        if (!cancelled) setOrdersError('Failed to load purchase orders.');
      } finally {
        if (!cancelled) setLoadingOrders(false);
      }
    };
    loadOrders();
    return () => { cancelled = true; };
  }, [API]);

  const availableOrders = useMemo(() => {
    if (!Array.isArray(purchaseOrders)) return [];
    return purchaseOrders.filter((order) => {
      const reference = order.orderNo || order._id;
      if (!reference) return false;
      return !usedReferences.includes(reference);
    });
  }, [purchaseOrders, usedReferences]);

  useEffect(() => {
    if (availableOrders.length === 0) {
      if (selectedOrderId) setSelectedOrderId('');
      applyOrderToForm(null);
      return;
    }

    const currentSelection = availableOrders.find((order) => order._id === selectedOrderId);
    const nextOrder = currentSelection || availableOrders[0];

    if (!selectedOrderId || nextOrder._id !== selectedOrderId) {
      setSelectedOrderId(nextOrder._id);
      applyOrderToForm(nextOrder);
    }
  }, [availableOrders, selectedOrderId, applyOrderToForm]);

  const handleOrderSelect = (orderId) => {
    setSelectedOrderId(orderId);
    const order = purchaseOrders.find((po) => po._id === orderId);
    if (order) {
      applyOrderToForm(order);
    } else {
      applyOrderToForm(null);
    }
  };

  const handleQuantityChange = (value) => {
    setQuantity(value);
    const valueNum = parseFloat(value);
    if (maxReturnQuantity != null && !Number.isNaN(valueNum) && valueNum > maxReturnQuantity) {
      const message = `Return quantity cannot exceed ${maxReturnQuantity} tons.`;
      setQuantityError(message);
    } else {
      setQuantityError('');
      if (error && error.startsWith('Return quantity')) setError('');
    }
  };

  // Load recent returns
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const res = await apiFetch(`${API}/gov-wheat/purchase-returns`);
        const data = await res.json();
        if (res.ok) setRecent(data.slice(0, 5)); // Show last 5
        if (res.ok) {
          const used = Array.from(new Set((data || []).map((r) => r.referencePurchaseNo).filter(Boolean)));
          setUsedReferences(used);
        }
      } catch (e) {
        console.error('Failed to load recent returns:', e);
        // Don't show error for recent returns failure
      }
    };
    loadRecent();
  }, [API]);

  const totalAmount = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const purchaseRate = parseFloat(rate) || 0;
    return (qty * purchaseRate).toFixed(2);
  }, [quantity, rate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!prCenter) {
      setError('Please select a PR center.');
      setSaving(false);
      return;
    }

    if (!purchaseInvoiceNo) {
      setError('Please select a reference purchase order.');
      setSaving(false);
      return;
    }

    if (quantityError) {
      setError(quantityError);
      setSaving(false);
      return;
    }

    const numericQuantity = Number(quantity) || 0;
    if (maxReturnQuantity != null && numericQuantity > maxReturnQuantity) {
      setError(`Return quantity cannot exceed ${maxReturnQuantity} tons.`);
      setSaving(false);
      return;
    }

    const payload = {
      returnDate,
      prCenter,
      supplier,
      referencePurchaseNo: purchaseInvoiceNo,
      quantity: numericQuantity,
      rate: Number(rate) || 0,
      totalAmount: Number(totalAmount) || 0,
      reason
    };

    try {
      const res = await apiFetch(`${API}/gov-wheat/purchase-returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        alert('✅ Government Wheat Purchase Return recorded successfully!');

        // Reset form
        setPurchaseInvoiceNo('');
        setReason('');
        setQuantity('');
        setRate('');
        setError('');

        // Refresh recent returns
        try {
          const recentRes = await apiFetch(`${API}/gov-wheat/purchase-returns`);
          if (recentRes.ok) {
            const recentData = await recentRes.json();
            setRecent(recentData.slice(0, 5));
            const used = Array.from(new Set((recentData || []).map((r) => r.referencePurchaseNo).filter(Boolean)));
            setUsedReferences(used);
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
    <PageShell title="Government Wheat Purchase Return">
            <div className="max-w-4xl mx-auto bg-slate-50 p-8 rounded-lg border border-slate-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {(error || centersError || ordersError) && (
                      <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                        {error || centersError || ordersError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="returnNo" className="block text-sm font-medium text-slate-700">Return Note No.</label>
                            <input
                type="text"
                id="returnNo"
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

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="prCenter" className="block text-sm font-medium text-slate-700">PR Center</label>
                            <select
                id="prCenter"
                value={prCenter}
                onChange={(e) => setPrCenter(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md disabled:bg-slate-100 disabled:text-slate-500"
                disabled={isOrderLocked || loadingCenters || prCenters.length === 0}>
                                {loadingCenters && <option>Loading PR centers...</option>}
                                {!loadingCenters && prCenters.length === 0 && <option>No PR centers available</option>}
                                {!loadingCenters && prCenters.map((c) => <option key={c._id} value={c._id}>{c.centerName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="supplier" className="block text-sm font-medium text-slate-700">Supplier</label>
                            <select
                id="supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md disabled:bg-slate-100 disabled:text-slate-500"
                disabled={isOrderLocked || suppliers.length === 0}>
                                {suppliers.length === 0 ? (
                                  <option>Loading suppliers...</option>
                                ) : (
                                  suppliers.map((s) => <option key={s._id} value={s._id}>{s.supplierName}</option>)
                                )}
                            </select>
                        </div>
                    </div>
                    <div>
                         <label htmlFor="purchaseInvoiceNo" className="block text-sm font-medium text-slate-700">Reference Govt. Purchase No.</label>
                            {loadingOrders ? (
                              <div className="mt-1 text-sm text-slate-500">Loading purchases...</div>
                            ) : availableOrders.length === 0 ? (
                              <div className="mt-1 text-sm text-slate-500">All purchase orders already have recorded returns.</div>
                            ) : (
                              <select
                id="purchaseInvoiceNo"
                value={selectedOrderId}
                onChange={(e) => handleOrderSelect(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                                {availableOrders.map((order) => (
                                  <option key={order._id} value={order._id}>
                                    {order.orderNo || order._id}
                                  </option>
                                ))}
                              </select>
                            )}

                    </div>
                    
                    <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                           <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">Return Qty. (Tons)</label>
                            {maxReturnQuantity != null && (
                              <p className="mt-1 text-xs text-slate-500">Max returnable: {maxReturnQuantity} tons</p>
                            )}
                            <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="0.00"
                required />
                            {quantityError && (
                              <p className="mt-1 text-xs text-red-600">{quantityError}</p>
                            )}

                        </div>
                        <div>
                           <label htmlFor="rate" className="block text-sm font-medium text-slate-700">Rate / Ton (Rs.)</label>
                            <input
                type="number"
                id="rate"
                value={rate}
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="From original purchase"
                required
                readOnly />

                        </div>
                        <div>
                           <label htmlFor="totalAmount" className="block text-sm font-medium text-slate-700">Total Return Value (Rs.)</label>
                            <input
                type="text"
                id="totalAmount"
                value={totalAmount}
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                disabled />

                        </div>
                    </div>

                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-slate-700">Reason for Return</label>
                        <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Auto-filled from voucher"
              readOnly>
            </textarea>
                    </div>

                    <div className="flex justify-end pt-4 border-t mt-6">
                        <button type="button" className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Cancel
                        </button>
                        <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Save Return Note
                        </button>
                    </div>
                </form>

                {/* Recent list */}
                <div className="mt-6 bg-white border rounded-md p-4">
                  <h4 className="text-sm font-semibold mb-2">Recent Government Wheat Purchase Returns</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Return Note No.</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">PR Center</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Reference P.O.</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Quantity</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Rate</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Total Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {recent.length === 0 ? (
                          <tr><td colSpan="8" className="text-center py-4 text-slate-500">No government purchase returns yet</td></tr>
                        ) : recent.map((r) => (
                          <tr key={r._id}>
                            <td className="px-4 py-2 text-sm">{new Date(r.returnDate).toLocaleDateString()}</td>
                            <td className="px-4 py-2 text-sm">{r.returnNoteNo || '-'}</td>
                            <td className="px-4 py-2 text-sm">{r.prCenter?.centerName || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm">{r.supplier?.supplierName || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm">{r.referencePurchaseNo || '-'}</td>
                            <td className="px-4 py-2 text-sm text-right">{r.quantity || 0} Tons</td>
                            <td className="px-4 py-2 text-sm text-right">Rs. {Number(r.rate || 0).toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm text-right">Rs. {Number(r.totalAmount || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
            </div>
        </PageShell>);

};

export default GovWheatPurchaseReturn;