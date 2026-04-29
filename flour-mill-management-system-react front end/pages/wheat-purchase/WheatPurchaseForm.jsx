
import React, { useState, useMemo } from 'react';
import PageShell from '../../components/PageShell';
import ErrorBanner from '../../components/ErrorBanner';
import apiFetch from '../../utils/apiFetch';

// Suppliers will be fetched from backend


const WheatPurchaseForm = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [suppliers, setSuppliers] = useState([]);
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().slice(0, 10));
  const [supplierId, setSupplierId] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [grossWeight, setGrossWeight] = useState(''); // in Kg
  const [tareWeight, setTareWeight] = useState(''); // in Kg
  const [moistureDeduction, setMoistureDeduction] = useState(''); // in Kg
  const [ratePer40Kg, setRatePer40Kg] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await apiFetch(`${API}/suppliers`);
        const data = await res.json();
        if (res.ok) {
          setSuppliers(data);
          if (data.length > 0) setSupplierId(data[0]._id);
          setError('');
        } else {
          setError(data.message || 'Failed to fetch suppliers');
        }
      } catch (err) {
        console.error('Error fetching suppliers:', err);
        setError('Error fetching suppliers');
      }
    };
    fetchSuppliers();
  }, [API]);

  const { netWeight, finalWeight, totalAmount } = useMemo(() => {
    const gross = parseFloat(grossWeight) || 0;
    const tare = parseFloat(tareWeight) || 0;
    const moisture = parseFloat(moistureDeduction) || 0;
    const rate = parseFloat(ratePer40Kg) || 0;

    const netWeight = gross > tare ? gross - tare : 0;
    const finalWeight = netWeight > moisture ? netWeight - moisture : 0;
    const totalAmount = finalWeight / 40 * rate;

    return {
      netWeight: netWeight.toFixed(2),
      finalWeight: finalWeight.toFixed(2),
      totalAmount: totalAmount.toFixed(2)
    };
  }, [grossWeight, tareWeight, moistureDeduction, ratePer40Kg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const purchaseData = {
      voucherDate,
      supplierId,
      vehicleNo,
      grossWeight: parseFloat(grossWeight) || 0,
      tareWeight: parseFloat(tareWeight) || 0,
      netWeight: parseFloat(netWeight) || 0,
      moistureDeduction: parseFloat(moistureDeduction) || 0,
      finalWeight: parseFloat(finalWeight) || 0,
      ratePer40Kg: parseFloat(ratePer40Kg) || 0,
      totalAmount: parseFloat(totalAmount) || 0,
      remarks
    };

    try {
      const res = await apiFetch(`${API}/wheat-purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData)
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ Wheat Purchase saved successfully!');
        // Reset form
        setVehicleNo('');
        setGrossWeight('');
        setTareWeight('');
        setMoistureDeduction('');
        setRatePer40Kg('');
        setRemarks('');
        setError('');
      } else {
        const msg = data.message || 'Failed to save purchase';
        setError(msg);
        alert('❌ Failed to save purchase: ' + msg);
      }
    } catch (err) {
      console.error('Error saving purchase:', err);
      setError('Server error while saving purchase');
      alert('Server error while saving purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Wheat Purchase Form">
            <div className="max-w-4xl mx-auto bg-slate-50 p-8 rounded-lg border border-slate-200">
                <ErrorBanner message={error} onClose={()=>setError('')} />
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="voucherNo" className="block text-sm font-medium text-slate-700">Voucher No.</label>
                            <input
                type="text"
                id="voucherNo"
                value="WP-2024-00112" // Example auto-generated number
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                disabled />

                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="voucherDate" className="block text-sm font-medium text-slate-700">Date</label>
                            <input
                type="date"
                id="voucherDate"
                value={voucherDate}
                onChange={(e) => setVoucherDate(e.target.value)}
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
                            <label htmlFor="vehicleNo" className="block text-sm font-medium text-slate-700">Vehicle No.</label>
                            <input
                type="text"
                id="vehicleNo"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., LE-1234" />

                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-t pt-6">
                        <div>
                           <label htmlFor="grossWeight" className="block text-sm font-medium text-slate-700">Gross Wt. (Kg)</label>
                            <input
                type="number"
                id="grossWeight"
                value={grossWeight}
                onChange={(e) => setGrossWeight(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="0.00"
                required />

                        </div>
                        <div>
                           <label htmlFor="tareWeight" className="block text-sm font-medium text-slate-700">Tare Wt. (Kg)</label>
                            <input
                type="number"
                id="tareWeight"
                value={tareWeight}
                onChange={(e) => setTareWeight(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="0.00"
                required />

                        </div>
                         <div>
                           <label htmlFor="netWeight" className="block text-sm font-medium text-slate-700">Net Wt. (Kg)</label>
                            <input
                type="text"
                id="netWeight"
                value={netWeight}
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                disabled />

                        </div>
                        <div>
                           <label htmlFor="moistureDeduction" className="block text-sm font-medium text-slate-700">Moisture Ded. (Kg)</label>
                            <input
                type="number"
                id="moistureDeduction"
                value={moistureDeduction}
                onChange={(e) => setMoistureDeduction(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="0.00" />

                        </div>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                           <label htmlFor="finalWeight" className="block text-sm font-medium text-slate-700">Final Wt. (Kg)</label>
                            <input
                type="text"
                id="finalWeight"
                value={finalWeight}
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                disabled />

                        </div>
                        <div>
                           <label htmlFor="ratePer40Kg" className="block text-sm font-medium text-slate-700">Rate / 40 Kg (Rs.)</label>
                            <input
                type="number"
                id="ratePer40Kg"
                value={ratePer40Kg}
                onChange={(e) => setRatePer40Kg(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="0.00"
                required />

                        </div>
                        <div>
                           <label htmlFor="totalAmount" className="block text-sm font-medium text-slate-700">Total Amount (Rs.)</label>
                            <input
                type="text"
                id="totalAmount"
                value={totalAmount}
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                disabled />

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

                    <div className="flex justify-end pt-4">
                        <button type="button" className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            {loading ? 'Saving...' : 'Save Purchase'}
                        </button>
                    </div>
                </form>
            </div>
        </PageShell>);

};

export default WheatPurchaseForm;