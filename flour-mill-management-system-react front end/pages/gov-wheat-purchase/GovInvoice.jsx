import React, { useState } from 'react';
import PageShell from '../../components/PageShell';
import apiFetch from '../../utils/apiFetch';
import { API_BASE_URL } from '../../utils/apiConfig';

const GovInvoice = () => {
  const API = API_BASE_URL;
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [invoiceNo, setInvoiceNo] = useState('Auto-generated');
  const [supplier, setSupplier] = useState('');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState([{ product: '', bags: '', weight: '' }]);
  const [saving, setSaving] = useState(false);

  const addRow = () => setItems(prev => [...prev, { product: '', bags: '', weight: '' }]);
  const removeRow = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateRow = (idx, key, val) => setItems(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { invoiceDate, supplier, remarks, items };
      const res = await apiFetch(`${API}/gov-wheat/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Invoice saved');
        setSupplier('');
        setRemarks('');
        setItems([{ product: '', bags: '', weight: '' }]);
      } else {
        alert(data?.message || 'Failed to save invoice');
      }
    } catch (err) {
      alert('Server error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="Govt Wheat Purchase Invoice">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Invoice No.</label>
                <input type="text" value={invoiceNo} disabled className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Invoice Date</label>
                <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Supplier</label>
                <input type="text" value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Supplier name" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">Items</h4>
                <button type="button" onClick={addRow} className="px-3 py-1 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">Add Row</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase">Bags</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase">Weight (kg)</th>
                      <th className="px-3 py-2 text-center text-xs font-medium text-slate-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {items.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">
                          <input type="text" value={row.product} onChange={e => updateRow(idx, 'product', e.target.value)} className="w-full px-2 py-1 border rounded" />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input type="number" value={row.bags} onChange={e => updateRow(idx, 'bags', e.target.value)} className="w-24 px-2 py-1 border rounded text-right" />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input type="number" value={row.weight} onChange={e => updateRow(idx, 'weight', e.target.value)} className="w-28 px-2 py-1 border rounded text-right" />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button type="button" onClick={() => removeRow(idx)} className="px-2 py-1 text-sm text-white bg-red-600 rounded">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Remarks</label>
              <textarea rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button type="submit" disabled={saving} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-primary hover:bg-blue-800">
                {saving ? 'Saving...' : 'Save Invoice'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageShell>
  );
};

export default GovInvoice;
