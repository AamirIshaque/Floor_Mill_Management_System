import React, { useState, useMemo, useEffect } from 'react';
import PageShell from '../../components/PageShell';
import ErrorBanner from '../../components/ErrorBanner';
import apiFetch from '../../utils/apiFetch';

const FinishGoodsPurchase = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  // Generate incremental voucher number
  const generateIncrementalVoucherNo = async () => {
    try {
      console.log('Fetching finished goods purchases for voucher generation...');
      const res = await apiFetch(`${API}/purchases/finished-goods`);
      const data = await res.json();
      console.log('API response status:', res.status);
      console.log('API response data:', data);

      if (res.ok && data.length > 0) {
        // Find the highest incremental voucher number (ignore date-based ones)
        const voucherNumbers = data
          .map(item => item.voucherNo)
          .filter(voucher => voucher && voucher.startsWith('FGP-'))
          .map(voucher => {
            const match = voucher.match(/FGP-(\d+)/);
            if (match) {
              const num = parseInt(match[1], 10);
              // Only consider numbers that are less than 10000 (incremental format)
              // Ignore date-based numbers like 20251029
              return num < 10000 ? num : 0;
            }
            return 0;
          })
          .filter(num => num > 0); // Only keep valid incremental numbers

        console.log('Valid incremental voucher numbers found:', voucherNumbers);

        const maxNumber = voucherNumbers.length > 0 ? Math.max(...voucherNumbers) : 0;
        const nextNumber = `FGP-${String(maxNumber + 1).padStart(4, '0')}`;
        console.log('Next voucher number:', nextNumber);
        return nextNumber;
      } else {
        // First voucher or no data
        console.log('No existing purchases or no data, using FGP-0001');
        return 'FGP-0001';
      }
    } catch (error) {
      console.error('Error generating voucher number:', error);
      return 'FGP-0001';
    }
  };

  const [supplier, setSupplier] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [voucherNo, setVoucherNo] = React.useState('Generating...');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [items, setItems] = useState([{ product: '', quantity: 1, rate: 0 }]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    // Set initial voucher number immediately
    setVoucherNo('FGP-0001');
    
    const loadData = async () => {
      try {
        setLoading(true);
        const [supRes, prodRes] = await Promise.all([
          apiFetch(`${API}/suppliers`),
          apiFetch(`${API}/products`)
        ]);

        if (supRes.ok) {
          const supData = await supRes.json();
          setSuppliers(supData);
          if (supData.length > 0) setSupplier(supData[0]._id);
        }

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData);
          if (prodData.length > 0) setItems([{ product: prodData[0]._id, quantity: 1, rate: 0 }]);
        }

        // Generate incremental voucher number
        try {
          const nextVoucherNo = await generateIncrementalVoucherNo();
          console.log('Generated voucher number:', nextVoucherNo);
          setVoucherNo(nextVoucherNo || 'FGP-0001');
        } catch (voucherError) {
          console.error('Failed to generate voucher number:', voucherError);
          setVoucherNo('FGP-0001');
        }
      } catch (e) {
        console.error('Failed to load data:', e);
        setError('Failed to load suppliers and products');
        setVoucherNo('FGP-0001'); // Ensure voucher number is always visible
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Load recent purchases
    const loadRecent = async () => {
      try {
        const res = await apiFetch(`${API}/purchases/finished-goods`);
        const data = await res.json();
        if (res.ok) setRecent(data.slice(0, 5)); // Show last 5
      } catch (e) {
        console.error('Failed to load recent purchases:', e);
      }
    };
    loadRecent();
  }, [API]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === 'product') {
      newItems[index][field] = value;
    } else if (field === 'quantity' || field === 'rate') {
      const numValue = parseFloat(value) || 0;
      newItems[index][field] = numValue;
    }
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { product: products.length > 0 ? products[0]._id : '', quantity: 1, rate: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const { subtotal, tax, grandTotal } = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
    const tax = subtotal * 0.05; // 5% tax
    const grandTotal = subtotal + tax;
    return { subtotal, tax, grandTotal };
  }, [items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Frontend validation
    if (!supplier || supplier === '') {
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
      if (!item.product || item.product === '') {
        setError(`Item ${i + 1}: Please select a product`);
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

    // Check for duplicate products
    const productIds = items.map(item => item.product);
    const uniqueProductIds = [...new Set(productIds)];
    if (productIds.length !== uniqueProductIds.length) {
      setError('Cannot purchase the same product multiple times. Please combine quantities.');
      setSaving(false);
      return;
    }

    const payload = {
      supplier,
      purchaseDate,
      voucherNo: voucherNo,
      vendorInvoiceNo: supplierInvoiceNo,
      items: items.map(i => ({
        product: i.product,
        qty: Number(i.quantity) || 0,
        rate: Number(i.rate) || 0,
        amount: (Number(i.quantity) || 0) * (Number(i.rate) || 0)
      })),
      totals: { subtotal, tax, grandTotal },
      remarks: supplierInvoiceNo ? `INV:${supplierInvoiceNo}` : ''
    };

    try {
      console.log('=== SENDING FINISHED GOODS PURCHASE ===');
      console.log('Payload:', JSON.stringify(payload, null, 2));

      const res = await apiFetch(`${API}/purchases/finished-goods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', res.status);

      const data = await res.json();
      console.log('Response data:', data);

      if (res.ok) {
        alert('✅ Finished Goods Purchase saved successfully!');
        // Reset form completely
        setSupplier(suppliers.length > 0 ? suppliers[0]._id : '');
        setPurchaseDate(new Date().toISOString().slice(0, 10));
        const newVoucherNo = await generateIncrementalVoucherNo();
        setVoucherNo(newVoucherNo);
        setSupplierInvoiceNo('');
        setItems(products.length > 0 ? [{ product: products[0]._id, quantity: 1, rate: 0 }] : [{ product: '', quantity: 1, rate: 0 }]);
        setError('');
        // refresh recent list
        const listRes = await apiFetch(`${API}/purchases/finished-goods`);
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
    <PageShell title="Finished Goods Purchase Voucher">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Finished Goods Purchase Voucher</h1>
                    <p className="text-slate-600 mt-1">Purchase finished goods like atta, flour, and other ready-to-sell products that will increase inventory</p>
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
                            <label htmlFor="supplier" className="block text-sm font-medium text-slate-700">Supplier</label>
                            <select
                id="supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                                {loading ? (
                                  <option>Loading suppliers...</option>
                                ) : suppliers.length === 0 ? (
                                  <option>No suppliers found</option>
                                ) : (
                                  suppliers.map((s) => (
                                    <option key={s._id} value={s._id}>{s.supplierName}</option>
                                  ))
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
                            <label htmlFor="supplierInvoiceNo" className="block text-sm font-medium text-slate-700">Supplier Invoice No.</label>
                            <input
                type="text"
                id="supplierInvoiceNo"
                value={supplierInvoiceNo}
                onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g. INV-FG-654" />

                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mt-6">
                         <h4 className="text-lg font-semibold text-slate-800 mb-2">Finished Goods Items</h4>
                         <p className="text-sm text-slate-500 mb-4">Select products like atta, flour, bran, and other finished goods to purchase for resale</p>
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
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
                                                <select 
                                                  value={item.product} 
                                                  onChange={(e) => handleItemChange(index, 'product', e.target.value)} 
                                                  className="w-full text-sm border-slate-300 rounded-md"
                                                >
                                                    {loading ? (
                                                      <option>Loading products...</option>
                                                    ) : products.length === 0 ? (
                                                      <option>No products found</option>
                                                    ) : (
                                                      products.map((p) => (
                                                        <option key={p._id} value={p._id}>
                                                          {p.productCode} - {p.productName}
                                                        </option>
                                                      ))
                                                    )}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input 
                                                  type="number" 
                                                  min="1" 
                                                  value={item.quantity} 
                                                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} 
                                                  className="w-full text-sm border-slate-300 rounded-md" 
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input 
                                                  type="number" 
                                                  min="0" 
                                                  step="0.01" 
                                                  value={item.rate} 
                                                  onChange={(e) => handleItemChange(index, 'rate', e.target.value)} 
                                                  className="w-full text-sm border-slate-300 rounded-md" 
                                                />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input 
                                                  type="text" 
                                                  value={((Number(item.quantity)||0) * (Number(item.rate)||0)).toFixed(2)} 
                                                  className="w-full text-sm bg-slate-100 border-slate-300 rounded-md" 
                                                  disabled 
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button 
                                                  type="button" 
                                                  onClick={() => handleRemoveItem(index)} 
                                                  className="text-red-500 hover:text-red-700 disabled:opacity-50" 
                                                  disabled={items.length <= 1}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                  )}
                                </tbody>
                            </table>
                         </div>
                         <button 
                           type="button" 
                           onClick={handleAddItem} 
                           className="mt-4 py-2 px-4 border border-dashed border-primary text-primary rounded-md text-sm font-medium hover:bg-blue-50"
                         >
                            + Add Another Finished Good
                         </button>
                    </div>

                    {/* Totals Section */}
                    <div className="flex justify-end">
                        <div className="w-full md:w-1/3 space-y-3">
                            <div className="flex justify-between">
                                <span className="font-medium text-slate-600">Subtotal:</span>
                                <span className="font-semibold text-slate-800">Rs. {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium text-slate-600">Tax (5%):</span>
                                <span className="font-semibold text-slate-800">Rs. {tax.toFixed(2)}</span>
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
                        <button type="submit" disabled={saving || loading} className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800">
                            {saving ? 'Saving...' : 'Save Finished Goods Purchase'}
                        </button>
                    </div>
                </form>

                {/* Recent list */}
                <div className="mt-6 bg-white border rounded-md p-4">
                  <h4 className="text-sm font-semibold mb-2">Recent Finished Goods Purchases</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Voucher No.</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Vendor Inv.</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Products</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Subtotal</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {loading ? (
                          <tr><td colSpan="7" className="text-center py-4 text-slate-500">Loading...</td></tr>
                        ) : !Array.isArray(recent) || recent.length === 0 ? (
                          <tr><td colSpan="7" className="text-center py-4 text-slate-500">No finished goods purchases yet</td></tr>
                        ) : (
                          recent.map((r) => (
                            <tr key={r._id}>
                              <td className="px-4 py-2 text-sm">{new Date(r.purchaseDate).toLocaleDateString()}</td>
                              <td className="px-4 py-2 text-sm">{r.voucherNo || '-'}</td>
                              <td className="px-4 py-2 text-sm">{r.supplier?.supplierName || '-'}</td>
                              <td className="px-4 py-2 text-sm">{r.vendorInvoiceNo || '-'}</td>
                              <td className="px-4 py-2 text-sm">
                                <div className="max-w-xs">
                                  {r.items?.map((item, index) => (
                                    <span key={index} className="inline-block">
                                      {item.product?.productName || 'N/A'}
                                      {index < (r.items?.length || 0) - 1 && ', '}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm text-right">{Number(r.subtotal||0).toFixed(2)}</td>
                              <td className="px-4 py-2 text-sm text-right">{Number(r.grandTotal||0).toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
            </div>
        </PageShell>
  );
};

export default FinishGoodsPurchase;