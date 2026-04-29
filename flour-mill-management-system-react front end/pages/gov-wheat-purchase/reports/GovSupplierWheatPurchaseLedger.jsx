import React from 'react';
import PageShell from '../../../components/PageShell';
import apiFetch from '../../../utils/apiFetch';
import { useSharedData } from '../../../context/DataProvider';

const GovSupplierWheatPurchaseLedger = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const { suppliers } = useSharedData();
  const [supplierId, setSupplierId] = React.useState('');
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const load = async () => {
    if (!supplierId) return;
    const q = new URLSearchParams({ supplierId });
    if (from) q.set('from', from);
    if (to) q.set('to', to);
    try {
      setLoading(true);
      const res = await apiFetch(`${API}/gov-wheat/reports/supplier-purchase-ledger?${q.toString()}`);
      const data = await res.json();
      if (res.ok) setRows(data);
    } catch (e) {} finally { setLoading(false); }
  };

  React.useEffect(() => {
    if (suppliers.length > 0 && !supplierId) {
      setSupplierId(suppliers[0]._id);
    }
  }, [suppliers, supplierId]);

  return (
    <PageShell title="Government Supplier Purchase Ledger">
<div className="mt-4 p-4 border rounded-md bg-white">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-slate-500">Supplier</label>
                    <select value={supplierId} onChange={(e)=>setSupplierId(e.target.value)} className="border rounded px-2 py-1 text-sm w-full">
                      <option value="">Select Supplier</option>
                      {suppliers.map(s => <option key={s._id} value={s._id}>{s.supplierName}</option>)}
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
                    <button onClick={load} disabled={!supplierId} className="px-4 py-2 text-sm rounded-md bg-primary text-white disabled:opacity-50">{loading ? 'Loading...' : 'View Report'}</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Voucher No</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Total Amount</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {rows.length === 0 ? (
                              <tr><td colSpan="4" className="px-4 py-6 text-center text-slate-500">No data</td></tr>
                            ) : rows.map((r, i)=> (
                              <tr key={i}>
                                <td className="px-4 py-2 text-sm">{new Date(r.date).toLocaleDateString()}</td>
                                <td className="px-4 py-2 text-sm">{r.voucherNo}</td>
                                <td className="px-4 py-2 text-sm text-right">{Number(r.totalAmount||0).toFixed(2)}</td>
                                <td className="px-4 py-2 text-sm">{r.remarks || '-'}</td>
                              </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageShell>);
};

export default GovSupplierWheatPurchaseLedger;
