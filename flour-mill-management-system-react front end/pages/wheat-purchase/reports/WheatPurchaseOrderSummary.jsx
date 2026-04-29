import React from 'react';
import PageShell from '../../../components/PageShell';
import apiFetch from '../../../utils/apiFetch';

const WheatPurchaseOrderSummary = () => {
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
      const res = await apiFetch(`${API}/wheat/reports/po-summary?${q.toString()}`);
      const data = await res.json();
      if (res.ok) setRows(data);
    } catch (e) {} finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, []);

  return (
    <PageShell title="Wheat Purchase Order Summary">
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
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Order No</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Order Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Delivery</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Subtotal</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {rows.length === 0 ? (
                              <tr><td colSpan="7" className="px-4 py-6 text-center text-slate-500">No data</td></tr>
                            ) : rows.map((r)=> (
                              <tr key={r._id}>
                                <td className="px-4 py-2 text-sm">{r.orderNo}</td>
                                <td className="px-4 py-2 text-sm">{r.supplierName || '-'}</td>
                                <td className="px-4 py-2 text-sm">{new Date(r.orderDate).toLocaleDateString()}</td>
                                <td className="px-4 py-2 text-sm">{new Date(r.deliveryDate).toLocaleDateString()}</td>
                                <td className="px-4 py-2 text-sm text-right">{Number(r.subtotal||0).toFixed(2)}</td>
                                <td className="px-4 py-2 text-sm text-right">{Number(r.grandTotal||0).toFixed(2)}</td>
                                <td className="px-4 py-2 text-sm">{r.status}</td>
                              </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageShell>);

};

export default WheatPurchaseOrderSummary;
