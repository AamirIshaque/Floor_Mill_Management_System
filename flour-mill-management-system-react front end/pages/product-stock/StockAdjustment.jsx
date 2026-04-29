import React, { useState } from 'react';
import PageShell from '../../components/PageShell';

// Mock data, consistent with other pages
const mockProducts = [
{ id: 'flour-ap', name: 'All-Purpose Flour (50kg)' },
{ id: 'flour-ww', name: 'Whole Wheat Flour (50kg)' },
{ id: 'bran', name: 'Wheat Bran (25kg)' },
{ id: 'semolina', name: 'Semolina (Sooji) (50kg)' }];


// Mock current stock levels for demonstration
const mockStockLevels = {
  'flour-ap': 520,
  'flour-ww': 350,
  'bran': 800,
  'semolina': 210
};

const StockAdjustment = () => {
  const [adjustmentDate, setAdjustmentDate] = useState(new Date().toISOString().slice(0, 10));
  const [adjustmentType, setAdjustmentType] = useState('decrease');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState([
  { productId: mockProducts[0].id, quantity: 1 }]
  );

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === 'productId') {
      newItems[index][field] = value;
    } else {
      newItems[index][field] = Math.abs(parseFloat(value) || 0); // Ensure quantity is always positive
    }
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { productId: mockProducts[0].id, quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const adjustmentData = {
      adjustmentDate,
      adjustmentType,
      remarks,
      items: items.map((item) => {
        const currentStock = mockStockLevels[item.productId] || 0;
        const adjustment = adjustmentType === 'increase' ? item.quantity : -item.quantity;
        return {
          ...item,
          currentStock,
          newStock: currentStock + adjustment
        };
      })
    };
    console.log("Stock Adjustment Data:", adjustmentData);
    alert('Stock adjustment saved successfully! (See console for data)');
  };

  return (
    <PageShell title="Stock Adjustment Voucher">
            <div className="max-w-6xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-slate-50 p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                    {/* Header Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="voucherNo" className="block text-sm font-medium text-slate-700">Voucher No.</label>
                            <input
                type="text"
                id="voucherNo"
                value="ADJ-2024-001"
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                disabled />

                        </div>
                        <div>
                            <label htmlFor="adjustmentDate" className="block text-sm font-medium text-slate-700">Adjustment Date</label>
                            <input
                type="date"
                id="adjustmentDate"
                value={adjustmentDate}
                onChange={(e) => setAdjustmentDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required />

                        </div>
                         <div>
                            <label htmlFor="adjustmentType" className="block text-sm font-medium text-slate-700">Adjustment Type</label>
                            <select
                id="adjustmentType"
                value={adjustmentType}
                onChange={(e) => setAdjustmentType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">

                                <option value="decrease">Decrease Stock (e.g., Damage, Loss)</option>
                                <option value="increase">Increase Stock (e.g., Physical Count)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="remarks" className="block text-sm font-medium text-slate-700">Reason / Remarks</label>
                        <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Provide a clear reason for this adjustment"
              required>
            </textarea>
                    </div>

                    {/* Items Table */}
                    <div className="mt-6">
                         <h4 className="text-lg font-semibold text-slate-800 mb-2">Items to Adjust</h4>
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg">
                                <thead className="bg-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">Current Stock</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-40">Adj. Quantity</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-40">New Stock</th>
                                        <th className="w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {items.map((item, index) => {
                    const currentStock = mockStockLevels[item.productId] || 0;
                    const adjustment = adjustmentType === 'increase' ? item.quantity : -item.quantity;
                    const newStock = currentStock + adjustment;
                    return (
                      <tr key={index}>
                                            <td className="px-4 py-2">
                                                <select value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} className="w-full text-sm border-slate-300 rounded-md">
                                                    {mockProducts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input type="text" value={currentStock} className="w-full text-sm bg-slate-100 border-slate-300 rounded-md" disabled />
                                            </td>
                                            <td className="px-4 py-2">
                                                <div className="relative">
                                                     <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold ${adjustmentType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {adjustmentType === 'increase' ? '+' : '-'}
                                                    </span>
                                                    <input type="number" min="0" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-full text-sm border-slate-300 rounded-md pl-8" />
                                                </div>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input type="text" value={newStock} className={`w-full text-sm bg-slate-100 border-slate-300 rounded-md ${newStock < 0 ? 'text-red-600 font-bold' : ''}`} disabled />
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 disabled:opacity-50" disabled={items.length <= 1}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </td>
                                        </tr>);
                  })}
                                </tbody>
                            </table>
                         </div>
                         <button type="button" onClick={handleAddItem} className="mt-4 py-2 px-4 border border-dashed border-primary text-primary rounded-md text-sm font-medium hover:bg-blue-50">
                            + Add Another Item
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end pt-6 border-t">
                        <button type="button" className="bg-white py-2 px-6 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Cancel
                        </button>
                        <button type="submit" className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800">
                            Save Adjustment
                        </button>
                    </div>
                </form>
            </div>
        </PageShell>);

};

export default StockAdjustment;