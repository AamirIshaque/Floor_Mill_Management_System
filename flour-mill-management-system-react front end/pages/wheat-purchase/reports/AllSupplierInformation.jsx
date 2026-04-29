import React from 'react';
import PageShell from '../../../components/PageShell';
import apiFetch from '../../../utils/apiFetch';

const AllSupplierInformation = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API}/wheat/reports/all-supplier-info`);
      const data = await res.json();
      if (res.ok) setRows(data);
    } catch (e) {} finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, []);

  return (
    <PageShell title="All Supplier Information">
<div className="mt-4 p-4 border rounded-md bg-white">
                <div className="flex justify-end mb-3">
                    <button onClick={load} className="px-4 py-2 text-sm rounded-md bg-primary text-white">{loading ? 'Loading...' : 'Refresh'}</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Phone</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Address</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Account Code</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Created</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {rows.length === 0 ? (
                              <tr><td colSpan="5" className="px-4 py-6 text-center text-slate-500">No suppliers</td></tr>
                            ) : rows.map((r)=> (
                              <tr key={r._id}>
                                <td className="px-4 py-2 text-sm">{r.supplierName}</td>
                                <td className="px-4 py-2 text-sm">{r.phone || '-'}</td>
                                <td className="px-4 py-2 text-sm">{r.address || '-'}</td>
                                <td className="px-4 py-2 text-sm">{r.accountCode || '-'}</td>
                                <td className="px-4 py-2 text-sm">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}</td>
                              </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageShell>);

};

export default AllSupplierInformation;
