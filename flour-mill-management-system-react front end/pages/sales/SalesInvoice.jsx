import React, { useState, useMemo } from 'react';
import PageShell from '../../components/PageShell';
import ErrorBanner from '../../components/ErrorBanner';
import apiFetch from '../../utils/apiFetch';

const SalesInvoice = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customer, setCustomer] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));

  // Calculate due date as 15 days from invoice date
  const calculateDueDate = (date) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 15);
    return newDate.toISOString().slice(0, 10);
  };
  const [dueDate, setDueDate] = useState(calculateDueDate(invoiceDate));

  const [items, setItems] = useState([{ productId: '', quantity: 1, rate: 0 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState([]);
  

  React.useEffect(() => {
    const load = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          apiFetch(`${API}/sales/customers`),
          apiFetch(`${API}/products`)
        ]);
        const cs = await cRes.json();
        const ps = await pRes.json();
        if (cRes.ok) {
          setCustomers(cs);
          if (cs.length > 0) setCustomer(cs[0]._id);
        } else {
          setError(cs.message || 'Failed to load customers');
        }
        if (pRes.ok) {
          setProducts(ps);
          if (ps.length > 0) setItems([{ productId: ps[0]._id, quantity: 1, rate: 0 }]);
        } else {
          setError(ps.message || 'Failed to load products');
        }
      } catch (e) { setError('Failed to load lookups'); }
    };
    load();
    
    // Load recent invoices
    const loadRecent = async () => {
      try {
        const res = await apiFetch(`${API}/sales/invoices`);
        const data = await res.json();
        if (res.ok) setRecent(data.slice(0, 5)); // Show last 5
      } catch (e) {
        console.error('Failed to load recent invoices:', e);
        // Don't show error for recent invoices failure
      }
    };
    loadRecent();
  }, [API]);

  const handleDateChange = (e) => {
    const newInvoiceDate = e.target.value;
    setInvoiceDate(newInvoiceDate);
    setDueDate(calculateDueDate(newInvoiceDate));
  };


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
    setItems([...items, { productId: products[0]?._id || '', quantity: 1, rate: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
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
    const payload = {
      customer,
      invoiceDate,
      dueDate,
      items: items.map(i => ({ product: i.productId, qty: Number(i.quantity)||0, rate: Number(i.rate)||0 })),
      totals: { subtotal, tax, grandTotal }
    };
    try {
      const res = await apiFetch(`${API}/sales/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ Sales Invoice saved successfully!');
        setError('');
        // refresh recent list
        const listRes = await apiFetch(`${API}/sales/invoices`);
        const listData = await listRes.json();
        if (listRes.ok) setRecent(listData.slice(0, 5));
      } else {
        const msg = data.message || 'Failed to save invoice';
        setError(msg);
        alert('❌ Failed: ' + msg);
      }
    } catch (err) {
      console.error('Error saving invoice', err);
      setError('Server error while saving invoice');
      alert('Server error while saving invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="Create Sales Invoice">
            <div className="max-w-6xl mx-auto">
                <ErrorBanner message={error} onClose={()=>setError('')} />
                <form onSubmit={handleSubmit} className="bg-slate-50 p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                    {/* Header Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label htmlFor="invoiceNo" className="block text-sm font-medium text-slate-700">Invoice No.</label>
                            <input
                type="text"
                id="invoiceNo"
                value="Auto-generated"
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                disabled />

                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="customer" className="block text-sm font-medium text-slate-700">Customer</label>
                            <select
                id="customer"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                                {customers.length === 0 ? (
                                  <option>Loading customers...</option>
                                ) : (
                                  customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)
                                )}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="invoiceDate" className="block text-sm font-medium text-slate-700">Invoice Date</label>
                            <input
                type="date"
                id="invoiceDate"
                value={invoiceDate}
                onChange={handleDateChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required />

                        </div>
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700">Due Date</label>
                            <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required />

                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mt-6">
                         <h4 className="text-lg font-semibold text-slate-800 mb-2">Invoice Items</h4>
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
                                                <select value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} className="w-full text-sm border-slate-300 rounded-md">
                                                    {products.length === 0 ? <option>Loading...</option> : products.map((p) => <option key={p._id} value={p._id}>{p.productCode} - {p.productName}</option>)}
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
                        <button type="submit" disabled={saving} className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800">
                            {saving ? 'Saving...' : 'Save Invoice'}
                        </button>
                    </div>
                </form>

                {/* Recent list */}
                <div className="mt-6 bg-white border rounded-md p-4">
                  <h4 className="text-sm font-semibold mb-2">Recent Sales Invoices</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Invoice No.</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Customer</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Items</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Subtotal</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {recent.length === 0 ? (
                          <tr><td colSpan="7" className="text-center py-4 text-slate-500">No sales invoices yet</td></tr>
                        ) : recent.map((r) => (
                          <tr key={r._id}>
                            <td className="px-4 py-2 text-sm">{new Date(r.invoiceDate).toLocaleDateString()}</td>
                            <td className="px-4 py-2 text-sm">{r.invoiceNo || '-'}</td>
                            <td className="px-4 py-2 text-sm">{r.customer?.name || '-'}</td>
                            <td className="px-4 py-2 text-sm">{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '-'}</td>
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
            </div>
        </PageShell>);

};

export default SalesInvoice;