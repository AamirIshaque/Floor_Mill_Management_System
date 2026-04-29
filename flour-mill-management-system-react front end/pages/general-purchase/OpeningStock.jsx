import React, { useState } from 'react';
import PageShell from '../../components/PageShell';
import apiFetch from '../../utils/apiFetch';

const OpeningStock = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [openingDate, setOpeningDate] = useState(new Date().toISOString().slice(0, 10));
  const [products, setProducts] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await apiFetch(`${API}/products`);
        const data = await res.json();
        if (res.ok) {
          setProducts(data);
          // Pre-populate with existing opening stock values
          setStockItems(data.map(p => ({
            id: p._id,
            quantity: p.openingStock ? p.openingStock.toString() : '',
            rate: '',
            currentStock: p.openingStock || 0
          })));
        }
      } catch (e) {
        console.error('Failed to load products:', e);
      }
    };
    loadProducts();
  }, [API]);

  const handleStockChange = (id, field, value) => {
    setStockItems((prevItems) =>
    prevItems.map((item) =>
    item.id === id ? { ...item, [field]: value } : item
    )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filled = stockItems.filter((i) => i.quantity && i.quantity !== '0');
    if (filled.length === 0) {
      alert('Please enter at least one opening stock row');
      return;
    }

    const hasRates = filled.some(i => i.rate && i.rate !== '');
    if (!hasRates) {
      if (!confirm('No rates entered. Opening stock will be saved without rate information. Continue?')) {
        return;
      }
    }

    setSaving(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const row of filled) {
        try {
          await apiFetch(`${API}/stock/opening`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product: row.id,
              qty: parseFloat(row.quantity) || 0,
              rate: parseFloat(row.rate) || 0,
              uom: products.find(p => p._id === row.id)?.uom || 'Unit',
              asOf: openingDate
            })
          });
          successCount++;
        } catch (err) {
          console.error(`Failed to save opening stock for product ${row.id}:`, err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        alert(`✅ Opening Stock saved successfully! (${successCount} products updated)`);
        // Refresh products to show updated opening stock
        const res = await apiFetch(`${API}/products`);
        const data = await res.json();
        if (res.ok) {
          setProducts(data);
          setStockItems(data.map(p => ({
            id: p._id,
            quantity: p.openingStock ? p.openingStock.toString() : '',
            rate: '',
            currentStock: p.openingStock || 0
          })));
        }
      }

      if (errorCount > 0) {
        alert(`⚠️ ${errorCount} products failed to update. Check console for details.`);
      }

    } catch (err) {
      console.error('Error saving opening stock', err);
      alert('Server error while saving opening stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell title="Opening Stock Entry">
            <form onSubmit={handleSubmit}>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="openingDate" className="text-sm font-medium text-slate-700">Opening Stock Date:</label>
                        <input
              type="date"
              id="openingDate"
              value={openingDate}
              onChange={(e) => setOpeningDate(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-primary focus:border-primary"
              required />

                    </div>
                     <p className="text-sm text-slate-500">
                        Set the opening stock quantities and rates for your products as of the selected date.
                        Products with existing opening stock are pre-populated. Changes will update both the opening stock records and product stock levels.
                        Rate information is optional but helps with stock valuation.
                    </p>
                </div>
                
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product Code</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-40">Current Stock</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-40">New Opening Quantity</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-40">Rate / Unit (Rs.)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {products.map((product, index) => {
                              const stockItem = stockItems[index];
                              const hasChange = stockItem && stockItem.quantity && stockItem.quantity !== stockItem.currentStock.toString();
                              return (
                                <tr key={product._id} className={`hover:bg-slate-50 ${hasChange ? 'bg-blue-50' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{product.productCode}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{product.productName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{product.uom}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                        <span className={`px-2 py-1 rounded text-xs ${stockItem?.currentStock > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                          {stockItem?.currentStock || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                          type="number"
                                          min="0"
                                          value={stockItem?.quantity || ''}
                                          onChange={(e) => handleStockChange(product._id, 'quantity', e.target.value)}
                                          className={`w-full text-sm border rounded-md ${hasChange ? 'border-blue-300 bg-blue-50' : 'border-slate-300'}`}
                                          placeholder="Enter quantity" />

                                    </td>
                                    <td className="px-6 py-4">
                                        <input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={stockItem?.rate || ''}
                                          onChange={(e) => handleStockChange(product._id, 'rate', e.target.value)}
                                          className="w-full text-sm border-slate-300 rounded-md"
                                          placeholder="Optional rate" />

                                    </td>
                                </tr>
                              );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end pt-6 mt-6 border-t">
                    <button type="submit" disabled={saving} className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800">
                        {saving ? 'Saving...' : 'Save Opening Stock'}
                    </button>
                </div>
            </form>
        </PageShell>);

};

export default OpeningStock;