import React from 'react';
import PageShell from '../../../components/PageShell';
import apiFetch from '../../../utils/apiFetch';

const GovPRCenterLedger = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [prCenters, setPrCenters] = React.useState([]);
  const [prCenterId, setPrCenterId] = React.useState('');
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadPRCenters();
  }, []);

  const loadPRCenters = async () => {
    try {
      const res = await apiFetch(`${API}/gov-wheat/pr-centers`);
      const data = await res.json();
      if (res.ok) {
        setPrCenters(data);
        if (data.length > 0 && !prCenterId) {
          setPrCenterId(data[0]._id);
        }
      }
    } catch (e) {}
  };

  const load = async () => {
    if (!prCenterId) return;
    const q = new URLSearchParams({ prCenterId });
    if (from) q.set('from', from);
    if (to) q.set('to', to);
    try {
      setLoading(true);
      const res = await apiFetch(`${API}/gov-wheat/reports/pr-center-ledger?${q.toString()}`);
      const data = await res.json();
      if (res.ok) setRows(data);
    } catch (e) {} finally { setLoading(false); }
  };

  return (
    <PageShell title="Government PR Center Ledger">
<div className="mt-4 p-4 border rounded-md bg-white">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-slate-500">PR Center</label>
                    <select value={prCenterId} onChange={(e)=>setPrCenterId(e.target.value)} className="border rounded px-2 py-1 text-sm w-full">
                      <option value="">Select PR Center</option>
                      {prCenters.map(c => <option key={c._id} value={c._id}>{c.centerName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500">From Date</label>
                    <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} className="border rounded px-2 py-1 text-sm w-full" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500">To Date</label>
                    <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} className="border rounded px-2 py-1 text-sm w-full" />
                  </div>
                  <div className="flex items-end justify-end">
                    <button onClick={load} disabled={!prCenterId} className="px-4 py-2 text-sm rounded-md bg-primary text-white disabled:opacity-50">{loading ? 'Loading...' : 'View Report'}</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Voucher No</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Gross</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Tare</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Net</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Final</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Rate/40kg</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {rows.length === 0 ? (
                              <tr><td colSpan="9" className="px-4 py-6 text-center text-slate-500">No data</td></tr>
                            ) : rows.map((r, i)=> (
                              <tr key={i}>
                                <td className="px-4 py-2 text-sm">{new Date(r.date).toLocaleDateString()}</td>
                                <td className="px-4 py-2 text-sm">{r.voucherNo}</td>
                                <td className="px-4 py-2 text-sm">{r.supplierName || '-'}</td>
                                <td className="px-4 py-2 text-sm">{r.grossWeight}</td>
                                <td className="px-4 py-2 text-sm">{r.tareWeight}</td>
                                <td className="px-4 py-2 text-sm">{r.netWeight}</td>
                                <td className="px-4 py-2 text-sm">{r.finalWeight}</td>
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

export default GovPRCenterLedger;
