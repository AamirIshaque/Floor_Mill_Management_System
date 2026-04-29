import React from 'react';
import PageShell from '../../../components/PageShell';
import apiFetch from '../../../utils/apiFetch';

const BardanaStatusReport = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API}/wheat/bags/reports/bardana-status`);
      const data = await res.json();
      if (res.ok) setRows(data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  return (
    <PageShell title="Bardana Status Report">
<div className="mt-4 p-4 border rounded-md bg-white">
                <div className="flex justify-end mb-3">
                    <button onClick={load} className="px-4 py-2 text-sm rounded-md bg-primary text-white">{loading ? 'Loading...' : 'Refresh'}</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Customer</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Issue</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Receive</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Return</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Purchase</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {rows.length === 0 ? (
                              <tr><td colSpan="6" className="px-4 py-6 text-center text-slate-500">No data</td></tr>
                            ) : rows.map((r, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-2 text-sm">{r.supplierName || '-'}</td>
                                <td className="px-4 py-2 text-sm">{r.customerName || '-'}</td>
                                <td className="px-4 py-2 text-sm text-right">{r.issue || 0}</td>
                                <td className="px-4 py-2 text-sm text-right">{r.receive || 0}</td>
                                <td className="px-4 py-2 text-sm text-right">{r.return || 0}</td>
                                <td className="px-4 py-2 text-sm text-right">{r.purchase || 0}</td>
                              </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageShell>);

};

export default BardanaStatusReport;
