import React, { useState } from 'react';
import PageShell from '../../../components/PageShell';
import apiFetch from '../../../utils/apiFetch';

const BagsReceive = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [receiptType, setReceiptType] = useState('filled_supplier');
  const [sourceId, setSourceId] = useState('');
  const [gatePassNo, setGatePassNo] = useState('');
  const [bagType, setBagType] = useState('50kg Jute Bag');
  const [quantity, setQuantity] = useState('');
  const [remarks, setRemarks] = useState('');

  React.useEffect(() => {
    const loadLookups = async () => {
      try {
        const [supRes, custRes] = await Promise.all([
          apiFetch(`${API}/suppliers`),
          apiFetch(`${API}/sales/customers`)
        ]);
        const sup = await supRes.json();
        const cus = await custRes.json();
        if (supRes.ok) setSuppliers(sup);
        if (custRes.ok) setCustomers(cus);
        // default source
        if (receiptType === 'empty_return_customer') {
          if (cus?.length) setSourceId(cus[0]._id);
        } else {
          if (sup?.length) setSourceId(sup[0]._id);
        }
      } catch (e) {
        console.error('Failed to load lookups', e);
      }
    };
    loadLookups();
  }, [API]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let url = '';
      let payload = {
        date: receiveDate,
        qty: parseFloat(quantity) || 0,
        remarks: `${remarks}${remarks ? ' | ' : ''}BagType: ${bagType}${gatePassNo ? ' | Ref: ' + gatePassNo : ''}`
      };
      if (receiptType === 'filled_supplier') {
        url = `${API}/wheat/bags/receives`;
        payload.supplier = sourceId;
      } else if (receiptType === 'empty_return_supplier') {
        url = `${API}/wheat/bags/returns`;
        payload.supplier = sourceId;
      } else if (receiptType === 'empty_return_customer') {
        url = `${API}/wheat/bags/receives`;
        payload.customer = sourceId;
      }
      const res = await apiFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) {
        alert('✅ Saved successfully!');
        setGatePassNo('');
        setQuantity('');
        setRemarks('');
      } else {
        alert('❌ Failed: ' + data.message);
      }
    } catch (err) {
      console.error('Error saving receipt', err);
      alert('Server error while saving');
    }
  };

  const isCustomerReceipt = receiptType === 'empty_return_customer';
  const sourceLabel = isCustomerReceipt ? 'Customer' : 'Supplier';
  const sourceList = isCustomerReceipt ? customers : suppliers;

  return (
    <PageShell title="Bags Receipt Voucher">
            <div className="max-w-4xl mx-auto bg-slate-50 p-8 rounded-lg border border-slate-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="voucherNo" className="block text-sm font-medium text-slate-700">Voucher No.</label>
                            <input
                type="text"
                id="voucherNo"
                value="BRV-2024-0099" // Example auto-generated number
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                disabled />

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
                            <label htmlFor="receiptType" className="block text-sm font-medium text-slate-700">Receipt Type</label>
                            <select
                id="receiptType"
                value={receiptType}
                onChange={(e) => {
                  setReceiptType(e.target.value);
                  // Reset source when type changes
                  if (e.target.value === 'empty_return_customer') {
                    setSourceId(customers[0]?._id || '');
                  } else {
                    setSourceId(suppliers[0]?._id || '');
                  }
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">

                                <option value="filled_supplier">Filled Bags from Wheat Supplier</option>
                                <option value="empty_return_supplier">Empty Bags Returned by Supplier</option>
                                <option value="empty_return_customer">Empty Bags Returned by Customer</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="sourceId" className="block text-sm font-medium text-slate-700">{sourceLabel}</label>
                            <select
                id="sourceId"
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                                {sourceList.length === 0 ? (
                                  <option>Loading...</option>
                                ) : (
                                  sourceList.map((s) => (
                                    <option key={s._id} value={s._id}>{s.supplierName || s.name}</option>
                                  ))
                                )}
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {receiptType === 'filled_supplier' &&
            <div>
                                <label htmlFor="gatePassNo" className="block text-sm font-medium text-slate-700">Gate Pass / Purchase No.</label>
                                <input
                type="text"
                id="gatePassNo"
                value={gatePassNo}
                onChange={(e) => setGatePassNo(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., GP-123 or WP-2024-00112"
                required />

                            </div>
            }
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
                        <div className={receiptType !== 'filled_supplier' ? 'md:col-span-2' : ''}>
                            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">Quantity of Bags Received</label>
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
              placeholder="Optional: any notes about this receipt">
            </textarea>
                    </div>

                    <div className="flex justify-end pt-4 border-t mt-6">
                        <button type="button" className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Cancel
                        </button>
                        <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Save Receipt
                        </button>
                    </div>
                </form>
            </div>
        </PageShell>);

};

export default BagsReceive;