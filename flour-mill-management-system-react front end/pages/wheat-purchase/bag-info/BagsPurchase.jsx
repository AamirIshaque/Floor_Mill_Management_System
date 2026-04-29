import React, { useState, useMemo } from 'react';
import PageShell from '../../../components/PageShell';
import apiFetch from '../../../utils/apiFetch';






const bagTypes = ['50kg Jute Bag', '100kg Jute Bag', '50kg Plastic Bag'];

const BagsPurchase = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [vendorId, setVendorId] = useState('');
  const [vendorInvoiceNo, setVendorInvoiceNo] = useState('');
  const [items, setItems] = useState([
  { bagType: bagTypes[0], quantity: 100, rate: 50 }]
  );
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await apiFetch(`${API}/suppliers`);
        const data = await res.json();
        if (res.ok) {
          setSuppliers(data);
          if (data.length > 0) setVendorId(data[0]._id);
        }
      } catch (e) {
        console.error('Failed to load suppliers', e);
      }
    };
    fetchSuppliers();
  }, [API]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === 'bagType') {
      newItems[index][field] = value;
    } else {
      newItems[index][field] = parseFloat(value) || 0;
    }
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { bagType: bagTypes[0], quantity: 1, rate: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const totalAmount = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
  }, [items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const totalQty = items.reduce((a, it) => a + (Number(it.quantity) || 0), 0);
    const info = { vendorInvoiceNo, items };
    const payload = {
      date: purchaseDate,
      supplier: vendorId,
      qty: totalQty,
      remarks: `${remarks}${remarks ? ' | ' : ''}${vendorInvoiceNo ? 'INV:' + vendorInvoiceNo + ' | ' : ''}${JSON.stringify(info)}`
    };
    try {
      const res = await apiFetch(`${API}/wheat/bags/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ Bags purchase recorded successfully!');
      } else {
        alert('❌ Failed: ' + data.message);
      }
    } catch (err) {
      console.error('Error saving bags purchase', err);
      alert('Server error while saving');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="Purchase New Bags (Bardana)">
            <div className="max-w-6xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-slate-50 p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label htmlFor="voucherNo" className="block text-sm font-medium text-slate-700">Purchase Voucher No.</label>
                            <input
                type="text"
                id="voucherNo"
                value="BPV-2024-0016" // Example auto-generated number
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                disabled />

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
                            <label htmlFor="vendorId" className="block text-sm font-medium text-slate-700">Vendor</label>
                            <select
                id="vendorId"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                                {suppliers.length === 0 ? (
                                  <option>Loading suppliers...</option>
                                ) : (
                                  suppliers.map((v) => (
                                    <option key={v._id} value={v._id}>{v.supplierName}</option>
                                  ))
                                )}
                            </select>
                        </div>
                        <div>
                           <label htmlFor="vendorInvoiceNo" className="block text-sm font-medium text-slate-700">Vendor Invoice No.</label>
                            <input
                type="text"
                id="vendorInvoiceNo"
                value={vendorInvoiceNo}
                onChange={(e) => setVendorInvoiceNo(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., INV-9876" />

                        </div>
                    </div>
                    
                    {/* Items Table */}
                    <div className="mt-6">
                         <h4 className="text-lg font-semibold text-slate-800 mb-2">Purchase Items</h4>
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bag Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Quantity (Pcs)</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-40">Rate / Bag (Rs.)</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-40">Amount (Rs.)</th>
                                        <th className="w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {items.map((item, index) =>
                  <tr key={index}>
                                            <td className="px-4 py-2">
                                                <select value={item.bagType} onChange={(e) => handleItemChange(index, 'bagType', e.target.value)} className="w-full text-sm border-slate-300 rounded-md">
                                                    {bagTypes.map((b) => <option key={b} value={b}>{b}</option>)}
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
                            + Add Another Bag Type
                        </button>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-full md:w-1/3 space-y-3">
                             <div className="flex justify-between border-t pt-3">
                                <span className="text-lg font-bold text-slate-800">Grand Total:</span>
                                <span className="text-lg font-bold text-slate-800">Rs. {totalAmount.toFixed(2)}</span>
                            </div>
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
              placeholder="Optional: any notes about this purchase">
            </textarea>
                    </div>

                    <div className="flex justify-end pt-6 border-t">
                        <button type="button" className="bg-white py-2 px-6 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800">
                            {saving ? 'Saving...' : 'Save Purchase'}
                        </button>
                    </div>
                </form>
            </div>
        </PageShell>);

};

export default BagsPurchase;