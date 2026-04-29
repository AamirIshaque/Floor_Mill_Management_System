import React from 'react';
import PageShell from '../../../components/PageShell';
import apiFetch from '../../../utils/apiFetch';

const StockLedger = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [products, setProducts] = React.useState([]);
  const [productId, setProductId] = React.useState('');
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await apiFetch(`${API}/products`);
        const data = await res.json();
        if (res.ok) {
          setProducts(data);
          if (data.length > 0) setProductId(data[0]._id);
        } else {
          setError('Failed to load products');
        }
      } catch (e) {
        setError('Failed to load products');
      }
    };
    loadProducts();
  }, [API]);

  const load = async () => {
    if (!productId) {
      setError('Please select a product');
      return;
    }
    const q = new URLSearchParams({ productId });
    if (from) q.append('from', from);
    if (to) q.append('to', to);
    try {
      setLoading(true);
      setError('');
      const res = await apiFetch(`${API}/stock/ledger?${q.toString()}`);
      const data = await res.json();
      if (res.ok) {
        // Calculate running balance
        let balance = 0;
        const processedData = data.map(row => {
          balance += row.qty;
          return {
            ...row,
            balance: balance
          };
        });
        setRows(processedData);
      } else {
        setError(data.message || 'Failed to load ledger');
      }
    } catch (e) {
      setError('Failed to load ledger data');
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find(p => p._id === productId);

  const formatRefType = React.useCallback((type) => {
    switch (type) {
      case 'SALES_INVOICE':
        return 'Sales Invoice';
      case 'SALES_RETURN':
        return 'Sales Return';
      case 'GENERAL_PURCHASE':
        return 'General Purchase';
      case 'FINISHED_GOODS_PURCHASE':
        return 'Finished Goods Purchase';
      case 'OPENING_STOCK':
        return 'Opening Stock';
      case 'ADJUSTMENT':
        return 'Adjustment';
      default:
        return type || '-';
    }
  }, []);

  const refTypeBadgeClass = React.useCallback((type) => {
    switch (type) {
      case 'OPENING_STOCK':
        return 'bg-green-100 text-green-800';
      case 'ADJUSTMENT':
        return 'bg-blue-100 text-blue-800';
      case 'SALES_INVOICE':
        return 'bg-red-100 text-red-800';
      case 'SALES_RETURN':
        return 'bg-amber-100 text-amber-800';
      case 'GENERAL_PURCHASE':
      case 'FINISHED_GOODS_PURCHASE':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  return (
    <PageShell title="Stock Ledger">
{error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      <div className="mt-4 p-4 border rounded-md bg-white">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
          <div className="md:col-span-2 flex items-center gap-2">
            <label className="text-sm font-medium">Product</label>
            <select 
              value={productId} 
              onChange={(e) => setProductId(e.target.value)} 
              className="border rounded px-2 py-1 text-sm w-full"
            >
              <option value="">Select Product...</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>
                  {p.productCode} - {p.productName} ({p.uom})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">From Date</label>
            <input 
              type="date" 
              value={from} 
              onChange={(e) => setFrom(e.target.value)} 
              className="border rounded px-2 py-1 text-sm w-full" 
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">To Date</label>
            <input 
              type="date" 
              value={to} 
              onChange={(e) => setTo(e.target.value)} 
              className="border rounded px-2 py-1 text-sm w-full" 
            />
          </div>
          <div className="flex items-end justify-end">
            <button 
              onClick={load} 
              disabled={loading || !productId}
              className="px-4 py-2 text-sm rounded-md bg-primary text-white w-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
            >
              {loading ? 'Loading...' : 'View Ledger'}
            </button>
          </div>
        </div>

        {selectedProduct && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Selected Product:</strong> {selectedProduct.productName} ({selectedProduct.productCode})
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Ref Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Ref No.</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Notes</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Qty In/Out</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Balance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-slate-500">
                    {loading ? 'Loading ledger data...' : 'No transactions found for the selected criteria'}
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-sm">
                      {new Date(r.txnDate || r.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${refTypeBadgeClass(r.refType)}`}>
                        {formatRefType(r.refType)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-slate-700">
                      {r.refNumber || r.refLabel || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm">{r.notes || '-'}</td>
                    <td className={`px-4 py-2 text-sm text-right font-medium ${
                      r.qty > 0 ? 'text-green-600' : r.qty < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {r.qty > 0 ? '+' : ''}{r.qty} {r.uom || selectedProduct?.uom || 'units'}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-semibold">
                      {r.balance} {r.uom || selectedProduct?.uom || 'units'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {rows.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Summary:</strong> {rows.length} transactions found. 
              Current balance: <strong>{rows[rows.length - 1]?.balance || 0}</strong> {selectedProduct?.uom || 'units'}
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default StockLedger;
