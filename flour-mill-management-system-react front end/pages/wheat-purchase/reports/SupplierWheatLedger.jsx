import React from 'react';
import PageShell from '../../../components/PageShell';
import apiFetch from '../../../utils/apiFetch';

const SupplierWheatLedger = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [suppliers, setSuppliers] = React.useState([]);
  const [supplierId, setSupplierId] = React.useState('');
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const res = await apiFetch(`${API}/suppliers`);
        const data = await res.json();
        if (res.ok) {
          setSuppliers(data);
          if (data.length > 0) setSupplierId(data[0]._id);
        }
      } catch (e) {}
    };
    loadSuppliers();
  }, [API]);

  const load = async () => {
    if (!supplierId) return;
    const q = new URLSearchParams({ supplierId });
    if (from) q.append('from', from);
    if (to) q.append('to', to);
    try {
      setLoading(true);
      const res = await apiFetch(`${API}/wheat/reports/supplier-wheat-ledger?${q.toString()}`);
      const data = await res.json();
      if (res.ok) setRows(data);
    } catch (e) {} finally { setLoading(false); }
  };

  return (
    <PageShell title="Supplier Wheat Ledger">
<div className="mt-4 p-4 border rounded-md bg-white">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3 mb-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-500">Supplier</label>
                    <select value={supplierId} onChange={(e)=>setSupplierId(e.target.value)} className="border rounded px-2 py-1 text-sm w-full">
                      {suppliers.length === 0 ? <option>Loading...</option> : suppliers.map(s => (
                        <option key={s._id} value={s._id}>{s.supplierName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500">From</label>
                    <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} className="border rounded px-2 py-1 text-sm w-full" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500">To</label>
                    <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} className="border rounded px-2 py-1 text-sm w-full" />
                  </div>
                  <div className="md:col-span-3 flex items-end justify-end">
                    <button onClick={load} className="px-4 py-2 text-sm rounded-md bg-primary text-white">{loading ? 'Loading...' : 'View Report'}</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Voucher No</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Gross</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Tare</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Net</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Moisture</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Final</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Rate/40kg</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {rows.length === 0 ? (
                              <tr><td colSpan="9" className="px-4 py-6 text-center text-slate-500">No data</td></tr>
                            ) : rows.map((r, idx)=> (
                              <tr key={idx}>
                                <td className="px-4 py-2 text-sm">{new Date(r.date).toLocaleDateString()}</td>
                                <td className="px-4 py-2 text-sm">{r.voucherNo}</td>
                                <td className="px-4 py-2 text-sm text-right">{r.grossWeight}</td>
                                <td className="px-4 py-2 text-sm text-right">{r.tareWeight}</td>
                                <td className="px-4 py-2 text-sm text-right">{r.netWeight}</td>
                                <td className="px-4 py-2 text-sm text-right">{r.moistureDeduction}</td>
                                <td className="px-4 py-2 text-sm text-right">{r.finalWeight}</td>
                                <td className="px-4 py-2 text-sm text-right">{Number(r.ratePer40Kg||0).toFixed(2)}</td>
                                <td className="px-4 py-2 text-sm text-right">{Number(r.totalAmount||0).toFixed(2)}</td>
                              </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageShell>);

};

export default SupplierWheatLedger;
