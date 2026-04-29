import React, { useState } from 'react';
import PageShell from '../../../components/PageShell';
import apiFetch from '../../../utils/apiFetch';

const BagsIssueToSupplier = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [suppliers, setSuppliers] = useState([]);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [supplierId, setSupplierId] = useState('');
  const [bagType, setBagType] = useState('50kg Jute Bag');
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');

  React.useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await apiFetch(`${API}/suppliers`);
        const data = await res.json();
        if (res.ok) {
          setSuppliers(data);
          if (data.length > 0) setSupplierId(data[0]._id);
        }
      } catch (e) {
        console.error('Failed to load suppliers', e);
      }
    };
    fetchSuppliers();
  }, [API]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      date: issueDate,
      supplier: supplierId,
      qty: parseFloat(quantity) || 0,
      remarks: `${remarks}${remarks ? ' | ' : ''}BagType: ${bagType}`
    };
    try {
      const res = await apiFetch(`${API}/wheat/bags/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ Bags issued successfully!');
        setQuantity('');
        setRemarks('');
      } else {
        alert('❌ Failed: ' + data.message);
      }
    } catch (err) {
      console.error('Error issuing bags', err);
      alert('Server error while saving issue');
    }
  };

  return (
    <PageShell title="Issue Bags to Supplier">
            <div className="max-w-4xl mx-auto bg-slate-50 p-8 rounded-lg border border-slate-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="voucherNo" className="block text-sm font-medium text-slate-700">Voucher No.</label>
                            <input
                type="text"
                id="voucherNo"
                value="BIV-2024-0056" // Example auto-generated number
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                disabled />

                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="issueDate" className="block text-sm font-medium text-slate-700">Issue Date</label>
                            <input
                type="date"
                id="issueDate"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required />

                        </div>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label htmlFor="supplierId" className="block text-sm font-medium text-slate-700">Supplier</label>
                            <select
                id="supplierId"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                                {suppliers.length === 0 ? (
                                  <option>Loading suppliers...</option>
                                ) : (
                                  suppliers.map((s) => (
                                    <option key={s._id} value={s._id}>{s.supplierName}</option>
                                  ))
                                )}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="bagType" className="block text-sm font-medium text-slate-700">Bag Type</label>
                            <select
                id="bagType"
                value={bagType}
                onChange={(e) => setBagType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">

                                <option>50kg Jute Bag</option>
                                <option>100kg Jute Bag</option>
                                <option>50kg Plastic Bag</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">Quantity of Bags (Pcs)</label>
                            <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., 500"
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
              placeholder="Optional: any notes about this issuance">
            </textarea>
                    </div>

                    <div className="flex justify-end pt-4 border-t mt-6">
                        <button type="button" className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Cancel
                        </button>
                        <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Save Issue
                        </button>
                    </div>
                </form>
            </div>
        </PageShell>);

};

export default BagsIssueToSupplier;