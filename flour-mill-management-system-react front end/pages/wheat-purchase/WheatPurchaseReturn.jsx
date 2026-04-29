import React, { useState, useMemo } from 'react';
import PageShell from '../../components/PageShell';

const mockSuppliers = [
{ id: 'sup-001', name: 'Modern Farms' },
{ id: 'sup-002', name: 'Punjab Growers' },
{ id: 'sup-003', name: 'Sindh Agriculture' }];


const WheatPurchaseReturn = () => {
  const [returnDate, setReturnDate] = useState(new Date().toISOString().slice(0, 10));
  const [supplierId, setSupplierId] = useState(mockSuppliers[0].id);
  const [purchaseInvoiceNo, setPurchaseInvoiceNo] = useState('');
  const [reason, setReason] = useState('');
  const [quantity, setQuantity] = useState(''); // in Kg
  const [rate, setRate] = useState(''); // Rate from original purchase, per 40Kg

  const totalAmount = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const purchaseRate = parseFloat(rate) || 0;
    return (qty / 40 * purchaseRate).toFixed(2);
  }, [quantity, rate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const returnData = {
      returnDate,
      supplierId,
      purchaseInvoiceNo,
      reason,
      quantity,
      rate,
      totalAmount
    };
    console.log("Wheat Purchase Return Data:", returnData);
    alert('Purchase Return recorded successfully! (See console for data)');
    // Reset form
    setPurchaseInvoiceNo('');
    setReason('');
    setQuantity('');
    setRate('');
  };

  return (
    <PageShell title="Wheat Purchase Return">
            <div className="max-w-4xl mx-auto bg-slate-50 p-8 rounded-lg border border-slate-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="returnNo" className="block text-sm font-medium text-slate-700">Return Note No.</label>
                            <input
                type="text"
                id="returnNo"
                value="WPR-2024-0021" // Example auto-generated number
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
                            <label htmlFor="supplierId" className="block text-sm font-medium text-slate-700">Supplier</label>
                            <select
                id="supplierId"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">

                                {mockSuppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="purchaseInvoiceNo" className="block text-sm font-medium text-slate-700">Reference Purchase Invoice No.</label>
                            <input
                type="text"
                id="purchaseInvoiceNo"
                value={purchaseInvoiceNo}
                onChange={(e) => setPurchaseInvoiceNo(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., WP-2024-00112"
                required />

                        </div>
                    </div>
                    
                    <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                           <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">Return Qty. (Kg)</label>
                            <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="0.00"
                required />

                        </div>
                        <div>
                           <label htmlFor="rate" className="block text-sm font-medium text-slate-700">Rate / 40 Kg (Rs.)</label>
                            <input
                type="number"
                id="rate"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="From original invoice"
                required />

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
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="e.g., Quality not as per sample, high moisture content"
              required>
            </textarea>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="button" className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Cancel
                        </button>
                        <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Save Return Note
                        </button>
                    </div>
                </form>
            </div>
        </PageShell>);

};

export default WheatPurchaseReturn;