import React from 'react';
import PageShell from '../../../components/PageShell';
const TrailBalance = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/vouchers/reports/trial-balance`);
      const data = await res.json();
      if (res.ok) setRows(data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const totals = rows.reduce((acc, r) => ({
    debit: acc.debit + (Number(r.debit)||0),
    credit: acc.credit + (Number(r.credit)||0)
  }), { debit:0, credit:0 });

  return (
    <PageShell title="Trial Balance Report">
<div className="mt-4 p-4 border rounded-md bg-white">
                <div className="flex justify-end mb-3">
                    <button onClick={load} className="px-4 py-2 text-sm rounded-md bg-primary text-white">{loading ? 'Loading...' : 'Refresh'}</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Code</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Account</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Debit</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Credit</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {rows.length === 0 ? (
                              <tr><td colSpan="4" className="px-4 py-6 text-center text-slate-500">No data</td></tr>
                            ) : rows.map((r) => (
                              <tr key={r.accountId}>
                                <td className="px-4 py-2 text-sm">{r.code}</td>
                                <td className="px-4 py-2 text-sm">{r.name}</td>
                                <td className="px-4 py-2 text-sm text-right">{Number(r.debit||0).toFixed(2)}</td>
                                <td className="px-4 py-2 text-sm text-right">{Number(r.credit||0).toFixed(2)}</td>
                              </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-50">
                                <td colSpan="2" className="px-4 py-2 text-right font-semibold">Totals</td>
                                <td className="px-4 py-2 text-right font-semibold">{totals.debit.toFixed(2)}</td>
                                <td className="px-4 py-2 text-right font-semibold">{totals.credit.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </PageShell>);

};

export default TrailBalance;
