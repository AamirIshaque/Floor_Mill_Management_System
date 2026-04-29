
import React, { useState, useMemo, useEffect } from 'react';
import PageShell from '../../components/PageShell';
import { useSharedData } from '../../context/DataProvider';
import apiFetch from '../../utils/apiFetch';

const GovWheatPurchaseOrder = () => {
  const { products } = useSharedData();
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [prCenters, setPrCenters] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [centersError, setCentersError] = useState('');
  const [prCenter, setPrCenter] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [deliveryDate, setDeliveryDate] = useState(new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().slice(0, 10));
  const [items, setItems] = useState([{ productId: '', quantity: 100, rate: 3900 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState([]);

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
            setPrCenters(Array.isArray(data) ? data : []);
            if (!prCenter && Array.isArray(data) && data.length > 0) {
              setPrCenter(data[0]._id);
              setContactPerson(data[0]?.contactPerson || '');
              setContactPhone(data[0]?.phoneNumber || '');
            }
          } else {
            setCentersError('Failed to load PR centers');
          }
        }
      } catch (e) {
        if (!cancelled) setCentersError('Failed to load PR centers');
      } finally {
        if (!cancelled) setLoadingCenters(false);
      }
    };
    loadCenters();
    return () => { cancelled = true; };
  }, [API]);

  useEffect(() => {
    if (!prCenter) {
      setContactPerson('');
      setContactPhone('');
      return;
    }
    const center = prCenters.find((c) => c._id === prCenter);
    if (center) {
      setContactPerson(center.contactPerson || '');
      setContactPhone(center.phoneNumber || '');
    }
  }, [prCenter, prCenters]);

  useEffect(() => {
    if (products.length > 0 && items.length === 1 && !items[0].productId) {
      setItems([{ productId: products[0]._id, quantity: 100, rate: 3900 }]);
    }
  }, [products, items]);

  // Load recent orders
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const res = await apiFetch(`${API}/gov-wheat/purchase-orders`);
        const data = await res.json();
        if (res.ok) setRecent(data.slice(0, 5)); // Show last 5
      } catch (e) {
        console.error('Failed to load recent orders:', e);
        // Don't show error for recent orders failure
      }
    };
    loadRecent();
  }, [API]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    const numValue = parseFloat(value) || 0;

    if (field === 'productId') {
      newItems[index][field] = value;
    } else {
      newItems[index][field] = numValue;
    }
    setItems(newItems);
  };

  const handleAddItem = () => {
    const defaultId = products[0]?._id || '';
    setItems([...items, { productId: defaultId, quantity: 1, rate: 3900 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const { subtotal, grandTotal } = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
    // Government purchases might have different tax structures, keeping it simple
    const grandTotal = subtotal;
    return { subtotal, grandTotal };
  }, [items]);

  const productLookup = useMemo(() => {
    return products.reduce((acc, product) => {
      if (product && product._id) acc[product._id] = product;
      return acc;
    }, {});
  }, [products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!prCenter) {
      setError('Please select a PR center.');
      setSaving(false);
      return;
    }

    const payload = {
      prCenter,
      prCenterContactName: contactPerson,
      prCenterContactPhone: contactPhone,
      orderDate,
      deliveryDate,
      items: items.map(i => ({
        productId: i.productId,
        quantity: Number(i.quantity) || 0,
        rate: Number(i.rate) || 0,
        amount: (Number(i.quantity) || 0) * (Number(i.rate) || 0)
      })),
      subtotal,
      tax: 0,
      grandTotal
    };

    try {
      const res = await apiFetch(`${API}/gov-wheat/purchase-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        alert('✅ Government Wheat Purchase Order created successfully!');
        setError('');

        // Reset form
        setOrderDate(new Date().toISOString().slice(0, 10));
        setDeliveryDate(new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().slice(0, 10));
        setItems(products.length > 0 ? [{ productId: products[0]._id, quantity: 100, rate: 3900 }] : [{ productId: '', quantity: 100, rate: 3900 }]);
        if (prCenters.length > 0) {
          const first = prCenters.find((c) => c._id === prCenter) || prCenters[0];
          setPrCenter(first?._id || '');
          setContactPerson(first?.contactPerson || '');
          setContactPhone(first?.phoneNumber || '');
        } else {
          setPrCenter('');
          setContactPerson('');
          setContactPhone('');
        }

        // Refresh recent orders
        try {
          const recentRes = await apiFetch(`${API}/gov-wheat/purchase-orders`);
          if (recentRes.ok) {
            const recentData = await recentRes.json();
            setRecent(recentData.slice(0, 5));
          }
        } catch (e) {
          console.error('Failed to refresh recent orders:', e);
        }
      } else {
        const msg = data.message || 'Failed to create order';
        setError(msg);
        alert('❌ Failed: ' + msg);
      }
    } catch (err) {
      console.error('Error creating order', err);
      setError('Server error while creating order');
      alert('Server error while creating order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="Create Government Wheat Purchase Order">
            <div className="max-w-6xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-slate-50 p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                    {(error || centersError) && (
                      <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                        {error || centersError}
                      </div>
                    )}
                    {/* Header Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label htmlFor="orderNo" className="block text-sm font-medium text-slate-700">P.O. No.</label>
                            <input
                type="text"
                id="orderNo"
                value="Auto-generated"
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                disabled />

                        </div>
                         <div>
                            <label htmlFor="orderDate" className="block text-sm font-medium text-slate-700">Order Date</label>
                            <input
                type="date"
                id="orderDate"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required />

                        </div>
                        <div>
                            <label htmlFor="prCenter" className="block text-sm font-medium text-slate-700">PR Center</label>
                            <select
                id="prCenter"
                value={prCenter}
                onChange={(e) => setPrCenter(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                disabled={loadingCenters || prCenters.length === 0}>

                                {loadingCenters && <option>Loading PR centers...</option>}
                                {!loadingCenters && prCenters.length === 0 && <option>No PR centers available</option>}
                                {!loadingCenters && prCenters.map((c) => <option key={c._id} value={c._id}>{c.centerName}</option>)}
                            </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">PR Center Contact</label>
                          <input
                type="text"
                value={contactPerson}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                placeholder="Auto-filled from PR center"
              />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700">Contact Phone</label>
                          <input
                type="text"
                value={contactPhone}
                readOnly
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                placeholder="Auto-filled from PR center"
              />
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mt-6">
                         <h4 className="text-lg font-semibold text-slate-800 mb-2">Order Items</h4>
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Quantity (Tons)</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-40">Govt. Rate / Ton (Rs.)</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-40">Amount (Rs.)</th>
                                        <th className="w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {items.map((item, index) =>
                  <tr key={index}>
                                            <td className="px-4 py-2">
                                                <select value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} className="w-full text-sm border-slate-300 rounded-md">
                                                    {products.length === 0 ? (
                                                      <option>Loading products...</option>
                                                    ) : (
                                                      products.map((p) => <option key={p._id} value={p._id}>{p.productName}</option>)
                                                    )}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-full text-sm border-slate-300 rounded-md" />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input type="number" min="0" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)} className="w-full text-sm border-slate-300 rounded-md" />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input type="text" value={(item.quantity * item.rate).toFixed(2)} className="w-full text-sm bg-slate-100 border-slate-300 rounded-md" disabled />
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 disabled:opacity-50" disabled={items.length <= 1}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                  )}
                                </tbody>
                            </table>
                         </div>
                         <button type="button" onClick={handleAddItem} className="mt-4 py-2 px-4 border border-dashed border-primary text-primary rounded-md text-sm font-medium hover:bg-blue-50">
                            + Add Another Item
                        </button>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end">
                        <div className="w-full md:w-1/3 space-y-3">
                            <div className="flex justify-between">
                                <span className="font-medium text-slate-600">Subtotal:</span>
                                <span className="font-semibold text-slate-800">Rs. {subtotal.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between border-t pt-3">
                                <span className="text-lg font-bold text-slate-800">Grand Total:</span>
                                <span className="text-lg font-bold text-slate-800">Rs. {grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end pt-6 border-t">
                        <button type="button" className="bg-white py-2 px-6 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancel
                        </button>
                        <button type="submit" className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800">
                            Create Purchase Order
                        </button>
                    </div>
                </form>

                {/* Recent list */}
                <div className="mt-6 bg-white border rounded-md p-4">
                  <h4 className="text-sm font-semibold mb-2">Recent Government Wheat Purchase Orders</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">P.O. No.</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">PR Center</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Contact Person</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Contact Phone</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Items</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Delivery Date</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Total Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {recent.length === 0 ? (
                          <tr><td colSpan="8" className="text-center py-4 text-slate-500">No government purchase orders yet</td></tr>
                        ) : recent.map((r) => (
                          <tr key={r._id}>
                            <td className="px-4 py-2 text-sm">{new Date(r.orderDate).toLocaleDateString()}</td>
                            <td className="px-4 py-2 text-sm">{r.orderNo || '-'}</td>
                            <td className="px-4 py-2 text-sm">{r.prCenter?.centerName || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm">{r.prCenterContactName || r.prCenter?.contactPerson || '-'}</td>
                            <td className="px-4 py-2 text-sm">{r.prCenterContactPhone || r.prCenter?.phoneNumber || '-'}</td>
                            <td className="px-4 py-2 text-sm">
                              <div className="max-w-xs space-y-1">
                                {r.items?.length ? (
                                  r.items.map((item, index) => {
                                    const product = productLookup[item.productId];
                                    const label = product?.productName || item.productName || 'Unnamed product';
                                    const qty = item.quantity ?? item.qty;
                                    const rate = item.rate;
                                    const formatter = [];
                                    if (label) formatter.push(label);
                                    if (qty) formatter.push(`${qty} tons`);
                                    if (rate) formatter.push(`@ Rs. ${Number(rate).toFixed(2)}`);
                                    return (
                                      <div key={index} className="flex items-center">
                                        <span>{formatter.join(' | ')}</span>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <span className="text-slate-400">No items</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm">{r.deliveryDate ? new Date(r.deliveryDate).toLocaleDateString() : '-'}</td>
                            <td className="px-4 py-2 text-sm text-right">{Number(r.grandTotal||0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
            </div>
        </PageShell>);

};

export default GovWheatPurchaseOrder;