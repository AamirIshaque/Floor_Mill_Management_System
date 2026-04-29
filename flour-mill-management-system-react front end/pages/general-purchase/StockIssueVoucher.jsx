import React, { useState, useEffect } from 'react';
import PageShell from '../../components/PageShell';
import ErrorBanner from '../../components/ErrorBanner';
import apiFetch from '../../utils/apiFetch';

const StockIssueVoucher = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const mockDepartments = ['Production', 'Maintenance', 'Administration', 'Sales'];

  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [issuedTo, setIssuedTo] = useState(mockDepartments[0]);
  const [remarks, setRemarks] = useState('');
  const [products, setProducts] = useState([]);
  const [available, setAvailable] = useState({}); // productId -> qty
  const [items, setItems] = useState([{ productId: '', quantity: 1 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, aRes] = await Promise.all([
          apiFetch(`${API}/products`),
          apiFetch(`${API}/stock/available`)
        ]);
        const p = await pRes.json();
        const a = await aRes.json();
        if (pRes.ok) {
          setProducts(p);
          if (p.length > 0) setItems([{ productId: p[0]._id, quantity: 1 }]);
        }
        if (aRes.ok) {
          const map = {};
          a.forEach(row => { map[row.productId] = row.availableQty; });
          setAvailable(map);
        }
      } catch (e) {
        console.error('Failed to load data:', e);
        setError('Failed to load products and stock data');
      }
    };
    load();
    
    // Load recent stock issues
    const loadRecent = async () => {
      try {
        const res = await apiFetch(`${API}/stock/issues`);
        const data = await res.json();
        if (res.ok) setRecent(data.slice(0, 5)); // Show last 5
      } catch (e) {
        console.error('Failed to load recent stock issues:', e);
        // Don't show error for recent issues failure
      }
    };
    loadRecent();
  }, [API]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === 'productId') {
      newItems[index][field] = value;
    } else {
      newItems[index][field] = Math.max(0, parseFloat(value) || 0); // Quantity cannot be negative
    }
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { productId: products[0]?._id || '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Frontend validation
    if (!remarks.trim()) {
      setError('Please enter remarks/reason for stock issue');
      setSaving(false);
      return;
    }

    if (!items || items.length === 0) {
      setError('Please add at least one item to issue');
      setSaving(false);
      return;
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId || item.productId === '') {
        setError(`Item ${i + 1}: Please select a product`);
        setSaving(false);
        return;
      }

      if (!item.quantity || item.quantity <= 0) {
        setError(`Item ${i + 1}: Please enter a valid quantity`);
        setSaving(false);
        return;
      }

      const availableStock = available[item.productId] || 0;
      if (item.quantity > availableStock) {
        setError(`Item ${i + 1}: Cannot issue ${item.quantity} units. Only ${availableStock} available in stock`);
        setSaving(false);
        return;
      }
    }

    // Check for duplicate products
    const productIds = items.map(item => item.productId);
    const uniqueProductIds = [...new Set(productIds)];
    if (productIds.length !== uniqueProductIds.length) {
      setError('Cannot issue the same product multiple times. Please combine quantities.');
      setSaving(false);
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    try {
      for (const row of items) {
        try {
          const product = products.find(p => p._id === row.productId);
          const res = await apiFetch(`${API}/stock/issues`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product: row.productId,
              qty: Number(row.quantity) || 0,
              uom: product?.uom || 'Unit',
              toDept: issuedTo,
              remarks: remarks.trim(),
              issueDate
            })
          });

          if (res.ok) {
            successCount++;
          } else {
            const errorData = await res.json();
            errorCount++;
            errors.push(`Failed to issue ${product?.productName || 'product'}: ${errorData.message || 'Unknown error'}`);
          }
        } catch (err) {
          errorCount++;
          const product = products.find(p => p._id === row.productId);
          errors.push(`Failed to issue ${product?.productName || 'product'}: ${err.message || 'Network error'}`);
        }
      }

      if (successCount > 0) {
        alert(`✅ Stock issue voucher saved successfully! (${successCount} items issued)`);

        // Reset form
        setIssueDate(new Date().toISOString().slice(0, 10));
        setRemarks('');
        setItems(products.length > 0 ? [{ productId: products[0]._id, quantity: 1 }] : [{ productId: '', quantity: 1 }]);
        setError('');

        // Refresh available stock
        try {
          const aRes = await apiFetch(`${API}/stock/available`);
          if (aRes.ok) {
            const a = await aRes.json();
            const map = {};
            a.forEach(row => { map[row.productId] = row.availableQty; });
            setAvailable(map);
          }
        } catch (e) {
          console.error('Failed to refresh stock data:', e);
        }

        // Refresh recent stock issues
        try {
          const recentRes = await apiFetch(`${API}/stock/issues`);
          if (recentRes.ok) {
            const recentData = await recentRes.json();
            setRecent(recentData.slice(0, 5));
          }
        } catch (e) {
          console.error('Failed to refresh recent stock issues:', e);
        }
      }

      if (errorCount > 0) {
        setError(`${errorCount} items failed to issue. Check console for details.`);
        console.error('Stock issue errors:', errors);
        alert(`⚠️ ${errorCount} items failed to issue. Check details in the error message above.`);
      }

    } catch (err) {
      console.error('Critical error saving stock issue:', err);
      setError('Critical error while saving stock issue');
      alert('Critical error while saving stock issue');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="Stock Issue Voucher">
            <div className="max-w-6xl mx-auto">
                <ErrorBanner message={error} onClose={()=>setError('')} />
                <form onSubmit={handleSubmit} className="bg-slate-50 p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                    {/* Header Fields */}
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
                        <div>
                            <label htmlFor="issueDate" className="block text-sm font-medium text-slate-700">Issue Date</label>
                            <input
                type="date"
                id="issueDate"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required />

                        </div>
                         <div>
                            <label htmlFor="issuedTo" className="block text-sm font-medium text-slate-700">Issue To (Department)</label>
                            <select
                id="issuedTo"
                value={issuedTo}
                onChange={(e) => setIssuedTo(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">

                                {mockDepartments.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="remarks" className="block text-sm font-medium text-slate-700">Reason / Remarks</label>
                        <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="e.g., Routine maintenance of machinery"
              required>
            </textarea>
                    </div>

                    {/* Items Table */}
                    <div className="mt-6">
                         <h4 className="text-lg font-semibold text-slate-800 mb-2">Items to Issue</h4>
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Available Stock</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-40">Issue Quantity</th>
                                        <th className="w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {items.map((item, index) => {
                    const product = products.find((p) => p._id === item.productId);
                    const availableStock = available[item.productId] ?? 0;
                    const hasLowStock = availableStock > 0 && availableStock < 10;
                    const isOutOfStock = availableStock === 0;
                    const isOverLimit = item.quantity > availableStock;
                    const hasError = isOutOfStock || isOverLimit;

                    return (
                      <tr key={index} className={`${hasError ? 'bg-red-50' : ''}`}>
                                            <td className="px-4 py-2">
                                                <select 
                                                  value={item.productId} 
                                                  onChange={(e) => handleItemChange(index, 'productId', e.target.value)} 
                                                  className={`w-full text-sm border rounded-md ${hasError ? 'border-red-300' : 'border-slate-300'}`}
                                                >
                                                    {products.length === 0 ? <option>Loading...</option> : products.map((p) => <option key={p._id} value={p._id}>{p.productCode} - {p.productName}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="flex items-center gap-2">
                                                  <input type="text" value={availableStock} className="w-16 text-sm bg-slate-100 border-slate-300 rounded-md text-center" disabled />
                                                  {isOutOfStock && (
                                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Out of Stock</span>
                                                  )}
                                                  {hasLowStock && !isOutOfStock && (
                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Low Stock</span>
                                                  )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input 
                                                  type="number" 
                                                  min="1" 
                                                  max={availableStock || 1} 
                                                  value={item.quantity} 
                                                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} 
                                                  className={`w-full text-sm border rounded-md ${isOverLimit ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                                                />
                                                {isOverLimit && (
                                                  <div className="text-xs text-red-600 mt-1">Exceeds available stock</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 disabled:opacity-50" disabled={items.length <= 1}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </td>
                                        </tr>);
                  })}
                                </tbody>
                            </table>
                         </div>
                         <button type="button" onClick={handleAddItem} className="mt-4 py-2 px-4 border border-dashed border-primary text-primary rounded-md text-sm font-medium hover:bg-blue-50">
                            + Add Another Item
                         </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end pt-6 border-t">
                        <button type="button" className="bg-white py-2 px-6 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800">
                            {saving ? 'Saving...' : 'Save & Issue Stock'}
                        </button>
                    </div>
                </form>

                {/* Recent list */}
                <div className="mt-6 bg-white border rounded-md p-4">
                  <h4 className="text-sm font-semibold mb-2">Recent Stock Issues</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Voucher No.</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Department</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Remarks</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Quantity</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">UOM</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {recent.length === 0 ? (
                          <tr><td colSpan="7" className="text-center py-4 text-slate-500">No stock issues yet</td></tr>
                        ) : recent.map((r) => (
                          <tr key={r._id}>
                            <td className="px-4 py-2 text-sm">{new Date(r.issueDate).toLocaleDateString()}</td>
                            <td className="px-4 py-2 text-sm">{r.voucherNo || '-'}</td>
                            <td className="px-4 py-2 text-sm">{r.product?.productName || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm">{r.toDept || '-'}</td>
                            <td className="px-4 py-2 text-sm max-w-xs truncate">{r.remarks || '-'}</td>
                            <td className="px-4 py-2 text-sm text-right">{r.qty || 0}</td>
                            <td className="px-4 py-2 text-sm">{r.uom || 'Unit'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
            </div>
        </PageShell>);

};

export default StockIssueVoucher;