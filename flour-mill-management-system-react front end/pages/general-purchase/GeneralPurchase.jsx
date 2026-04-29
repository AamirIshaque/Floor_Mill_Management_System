import React, { useState, useMemo, useEffect } from 'react';
import PageShell from '../../components/PageShell';
import ErrorBanner from '../../components/ErrorBanner';
import apiFetch from '../../utils/apiFetch';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const GeneralPurchase = () => {
  const [vendor, setVendor] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  // Generate incremental voucher number
  const generateIncrementalVoucherNo = async () => {
    try {
      const res = await apiFetch(`${API}/purchases/general`);
      const data = await res.json();
      if (res.ok && data.length > 0) {
        // Find the highest incremental voucher number (ignore date-based ones)
        const voucherNumbers = data
          .map(item => item.voucherNo)
          .filter(voucher => voucher && voucher.startsWith('GPV-'))
          .map(voucher => {
            const match = voucher.match(/GPV-(\d+)/);
            if (match) {
              const num = parseInt(match[1], 10);
              // Only consider numbers that are less than 10000 (incremental format)
              // Ignore date-based numbers like 20251029
              return num < 10000 ? num : 0;
            }
            return 0;
          })
          .filter(num => num > 0); // Only keep valid incremental numbers

        const maxNumber = voucherNumbers.length > 0 ? Math.max(...voucherNumbers) : 0;
        return `GPV-${String(maxNumber + 1).padStart(4, '0')}`;
      } else {
        // First voucher
        return 'GPV-0001';
      }
    } catch (error) {
      console.error('Error generating voucher number:', error);
      return 'GPV-0001';
    }
  };

  const [voucherNo, setVoucherNo] = React.useState('GPV-0001');
  const [vendorInvoiceNo, setVendorInvoiceNo] = useState('');
  const [items, setItems] = useState([{ description: '', quantity: 1, rate: 0 }]); // Office supplies only
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const loadLookups = async () => {
      try {
        setLoading(true);
        setError('');
        const supRes = await apiFetch(`${API}/suppliers`);
        const supData = await supRes.json();
        if (supRes.ok) {
          setSuppliers(supData);
          if (supData.length > 0) {
            setVendor(supData[0]._id);
          } else {
            // No suppliers found - show helpful message
            setError('No suppliers found. Please add suppliers first before making purchases.');
          }
        } else {
          // API error - could be authentication or server issue
          if (supRes.status === 401) {
            setError('Authentication failed. Please login again.');
          } else if (supRes.status === 500) {
            setError('Server error. Please check if the backend server is running.');
          } else {
            setError(sup.message || 'Failed to load suppliers from server');
          }
        }

        // Generate incremental voucher number
        const nextVoucherNo = await generateIncrementalVoucherNo();
        setVoucherNo(nextVoucherNo);
      } catch (e) {
        console.error('Failed to load suppliers:', e);
        // Network error or other issue
        setError('Unable to connect to server. Please check your internet connection and server status.');
      } finally {
        setLoading(false);
      }
    };
    
    loadLookups();
    
    // Load recent purchases
    const loadRecent = async () => {
      try {
        const res = await apiFetch(`${API}/purchases/general`);
        const data = await res.json();
        if (res.ok) setRecent(data.slice(0, 5)); // Show last 5
      } catch (e) {
        console.error('Failed to load recent purchases:', e);
        // Don't show error for recent purchases failure
      }
    };
    loadRecent();
  }, [API]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === 'description') {
      newItems[index][field] = value;
    } else if (field === 'quantity' || field === 'rate') {
      const numValue = parseFloat(value) || 0;
      newItems[index][field] = numValue;
    }
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const { subtotal, grandTotal } = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
    const grandTotal = subtotal;
    return { subtotal, grandTotal };
  }, [items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    // Frontend validation
    if (!vendor || vendor === '') {
      setError('Please select a supplier');
      setSaving(false);
      return;
    }
    
    if (!items || items.length === 0) {
      setError('Please add at least one item');
      setSaving(false);
      return;
    }
    
    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.description || item.description.trim() === '') {
        setError(`Item ${i + 1}: Please enter a description`);
        setSaving(false);
        return;
      }
      
      if (!item.quantity || item.quantity <= 0) {
        setError(`Item ${i + 1}: Please enter a valid quantity`);
        setSaving(false);
        return;
      }
      
      if (item.rate < 0) {
        setError(`Item ${i + 1}: Rate cannot be negative`);
        setSaving(false);
        return;
      }
    }
    
    // Check for duplicate descriptions
    const descriptions = items.map(item => item.description.trim().toLowerCase());
    const uniqueDescriptions = [...new Set(descriptions)];
    if (descriptions.length !== uniqueDescriptions.length) {
      setError('Cannot have duplicate item descriptions. Please make descriptions unique.');
      setSaving(false);
      return;
    }
    
    const payload = {
      supplier: vendor,
      purchaseDate,
      voucherNo: voucherNo,
      vendorInvoiceNo,
      items: items.map(i => ({
        qty: Number(i.quantity) || 0,
        rate: Number(i.rate) || 0,
        amount: (Number(i.quantity)||0)*(Number(i.rate)||0),
        isCustomItem: true,
        customDescription: i.description.trim(),
        itemName: i.description.trim()
      })),
      totals: { subtotal, tax: 0, grandTotal },
      remarks: vendorInvoiceNo ? `INV:${vendorInvoiceNo}` : ''
    };
    
    try {
      console.log('=== SENDING OFFICE SUPPLIES PURCHASE ===');
      console.log('Payload:', JSON.stringify(payload, null, 2));
      
      const res = await apiFetch(`${API}/purchases/general`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log('Response status:', res.status);
      
      const data = await res.json();
      console.log('Response data:', data);
      
      if (res.ok) {
        alert('✅ Office Supplies Purchase saved successfully!');
        // Reset form completely
        setVendor(suppliers.length > 0 ? suppliers[0]._id : '');
        setPurchaseDate(new Date().toISOString().slice(0, 10));
        const newVoucherNo = await generateIncrementalVoucherNo();
        setVoucherNo(newVoucherNo);
        setVendorInvoiceNo('');
        setItems([{ description: '', quantity: 1, rate: 0 }]);
        setError('');
        // refresh recent list
        const listRes = await apiFetch(`${API}/purchases/general`);
        const listData = await listRes.json();
        if (listRes.ok) setRecent(listData.slice(0, 5));
      } else {
        const msg = data.message || 'Failed to save';
        console.error('API Error:', msg);
        console.error('Full error response:', data);
        setError(msg);
        alert('❌ Failed: ' + msg);
      }
    } catch (err) {
      console.error('=== NETWORK ERROR ===');
      console.error('Error details:', err);
      setError('Server error while saving');
      alert('Server error while saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="Office Supplies Purchase">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Office Supplies & Equipment Purchase</h1>
                    <p className="text-slate-600 mt-1">Purchase office furniture, equipment, supplies, and other non-inventory items</p>
                    {suppliers.length === 0 && !loading && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">No Suppliers Available</h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <p>You need to add suppliers before making purchases. Go to <strong>Wheat Purchase → Supplier Entry</strong> to add suppliers.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <ErrorBanner message={error} onClose={()=>setError('')} />
                <form onSubmit={handleSubmit} className="bg-slate-50 p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                    {/* Header Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label htmlFor="voucherNo" className="block text-sm font-medium text-slate-700">Voucher No.</label>
                            <input
                type="text"
                id="voucherNo"
                value={voucherNo}
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                disabled />

                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="vendor" className="block text-sm font-medium text-slate-700">Vendor</label>
                            <select
                id="vendor"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                                {loading ? (
                                  <option>Loading suppliers...</option>
                                ) : suppliers.length === 0 ? (
                                  <option value="" disabled>No suppliers available - Please add suppliers first</option>
                                ) : (
                                  <>
                                    <option value="">Select Supplier</option>
                                    {suppliers.map((s) => (
                                      <option key={s._id} value={s._id}>{s.supplierName}</option>
                                    ))}
                                  </>
                                )}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="purchaseDate" className="block text-sm font-medium text-slate-700">Purchase Date</label>
                            <input
                type="date"
                id="purchaseDate"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required />

                        </div>
                         <div>
                            <label htmlFor="vendorInvoiceNo" className="block text-sm font-medium text-slate-700">Vendor Invoice No.</label>
                            <input
                type="text"
                id="vendorInvoiceNo"
                value={vendorInvoiceNo}
                onChange={(e) => setVendorInvoiceNo(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g. INV-12345" />

                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mt-6">
                         <h4 className="text-lg font-semibold text-slate-800 mb-2">Office Supplies & Equipment Items</h4>
                         <p className="text-sm text-slate-500 mb-4">Enter descriptions for office chairs, printers, stationery, maintenance supplies, etc.</p>
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item Description</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Quantity</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-40">Rate (Rs.)</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-40">Amount (Rs.)</th>
                                        <th className="w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {items.map((item, index) =>
                  <tr key={index}>
                                            <td className="px-4 py-2">
                                                <input
                                                  type="text"
                                                  value={item.description}
                                                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                  placeholder="e.g., Office Chair, Printer Paper, Computer Mouse, etc."
                                                  className="w-full text-sm border-slate-300 rounded-md"
                                                  required
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-full text-sm border-slate-300 rounded-md" />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input type="number" min="0" step="0.01" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)} className="w-full text-sm border-slate-300 rounded-md" />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input type="text" value={((Number(item.quantity)||0) * (Number(item.rate)||0)).toFixed(2)} className="w-full text-sm bg-slate-100 border-slate-300 rounded-md" disabled />
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
                            + Add Another Office Item
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
                        <button type="submit" disabled={saving} className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800">
                            {saving ? 'Saving...' : 'Save Office Purchase'}
                        </button>
                    </div>
                </form>

                {/* Recent list */}
                <div className="mt-6 bg-white border rounded-md p-4">
                  <h4 className="text-sm font-semibold mb-2">Recent Office Supplies Purchases</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Voucher No.</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Vendor Inv.</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Items</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Subtotal</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {recent.length === 0 ? (
                          <tr><td className="px-4 py-4 text-center text-slate-500" colSpan="7">No purchases yet</td></tr>
                        ) : recent.map((r) => (
                          <tr key={r._id}>
                            <td className="px-4 py-2 text-sm">{new Date(r.purchaseDate).toLocaleDateString()}</td>
                            <td className="px-4 py-2 text-sm">{r.voucherNo || '-'}</td>
                            <td className="px-4 py-2 text-sm">{r.supplier?.supplierName || '-'}</td>
                            <td className="px-4 py-2 text-sm">{r.vendorInvoiceNo || '-'}</td>
                            <td className="px-4 py-2 text-sm">
                              <div className="max-w-xs">
                                {r.items?.map((item, index) => (
                                  <span key={index} className="inline-block">
                                    {item.customDescription || item.itemName || 'N/A'}
                                    {index < (r.items?.length || 0) - 1 && ', '}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-right">{Number(r.subtotal||0).toFixed(2)}</td>
                            <td className="px-4 py-2 text-sm text-right">{Number(r.grandTotal||0).toFixed(2)}</td>
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

export default GeneralPurchase;