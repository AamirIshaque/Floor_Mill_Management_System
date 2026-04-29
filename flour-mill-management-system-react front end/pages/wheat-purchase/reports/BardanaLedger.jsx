import React from 'react';
import PageShell from '../../../components/PageShell';
import apiFetch from '../../../utils/apiFetch';

const BardanaLedger = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [suppliers, setSuppliers] = React.useState([]);
  const [supplierId, setSupplierId] = React.useState('');
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
    try {
      setLoading(true);
      const res = await apiFetch(`${API}/wheat/bags/reports/bardana-ledger?supplier=${supplierId}`);
      const data = await res.json();
      if (res.ok) setRows(data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Bardana Ledger">
<div className="mt-4 p-4 border rounded-md bg-white">
                <div className="flex items-center gap-3 mb-3">
                    <label className="text-sm">Supplier</label>
                    <select value={supplierId} onChange={(e)=>setSupplierId(e.target.value)} className="border rounded px-2 py-1 text-sm">
                        {suppliers.length === 0 ? <option>Loading...</option> : suppliers.map(s => (
                          <option key={s._id} value={s._id}>{s.supplierName}</option>
                        ))}
                    </select>
                    <button onClick={load} className="ml-auto px-4 py-2 text-sm rounded-md bg-primary text-white">{loading ? 'Loading...' : 'View Report'}</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Qty</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {rows.length === 0 ? (
                              <tr><td colSpan="4" className="px-4 py-6 text-center text-slate-500">No data</td></tr>
                            ) : rows.map((r, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-2 text-sm">{new Date(r.date).toLocaleDateString()}</td>
                                <td className="px-4 py-2 text-sm">{r.type}</td>
                                <td className="px-4 py-2 text-sm text-right">{r.qty}</td>
                                <td className="px-4 py-2 text-sm">{r.remarks || '-'}</td>
                              </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageShell>);

};

export default BardanaLedger;
