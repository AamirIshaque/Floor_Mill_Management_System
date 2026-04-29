import React from 'react';
import PageShell from '../../../components/PageShell';
import apiFetch from '../../../utils/apiFetch';

const WheatPurchaseBook = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const load = async () => {
    const q = new URLSearchParams({});
    if (from) q.append('from', from);
    if (to) q.append('to', to);
    try {
      setLoading(true);
      const res = await apiFetch(`${API}/wheat/reports/purchase-book?${q.toString()}`);
      const data = await res.json();
      if (res.ok) setRows(data);
    } catch (e) {} finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, []);

  return (
    <PageShell title="Wheat Purchase Book">
<div className="mt-4 p-4 border rounded-md bg-white">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
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
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Voucher No</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Final Wt.</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Rate/40kg</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {rows.length === 0 ? (
                              <tr><td colSpan="6" className="px-4 py-6 text-center text-slate-500">No data</td></tr>
                            ) : rows.map((r)=> (
                              <tr key={r._id}>
                                <td className="px-4 py-2 text-sm">{r.voucherNo}</td>
                                <td className="px-4 py-2 text-sm">{new Date(r.voucherDate).toLocaleDateString()}</td>
                                <td className="px-4 py-2 text-sm">{r.supplierId?.supplierName || '-'}</td>
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

export default WheatPurchaseBook;
