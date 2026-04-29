import React, { useState, useEffect, useMemo } from 'react';
import PageShell from '../../components/PageShell';
import apiFetch from '../../utils/apiFetch';
import { useSharedData } from '../../context/DataProvider';

// Products will be fetched from backend

const WheatPurchaseOrder = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const { suppliers, products } = useSharedData();
  const [supplier, setSupplier] = useState('');
  const [orderNo] = useState(
    `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now()
      .toString()
      .slice(-4)}`
  );
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().slice(0, 10)
  );
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Initialize supplier when shared suppliers are loaded
  useEffect(() => {
    if (suppliers.length > 0 && !supplier) setSupplier(suppliers[0]._id);
  }, [suppliers, supplier]);

  // Products are provided by DataProvider

  // Initialize one row when products arrive
  useEffect(() => {
    if (products.length > 0 && items.length === 0) {
      setItems([{ productId: products[0]._id, quantity: 50, rate: 3500 }]);
    }
  }, [products, items.length]);

  // ✅ Handle item changes
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    const numValue = parseFloat(value) || 0;
    newItems[index][field] = field === 'productId' ? value : numValue;
    setItems(newItems);
  };

  const handleAddItem = () => {
    const defaultProductId = products[0]?._id || '';
    setItems([...items, { productId: defaultProductId, quantity: 1, rate: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  // ✅ Calculate totals
  const { subtotal, tax, grandTotal, updatedItems } = useMemo(() => {
    const updatedItems = items.map((item) => ({
      ...item,
      total: item.quantity * item.rate,
    }));
    const subtotal = updatedItems.reduce((acc, item) => acc + item.total, 0);
    const tax = 0;
    const grandTotal = subtotal + tax;
    return { subtotal, tax, grandTotal, updatedItems };
  }, [items]);

  // ✅ Submit order
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      supplier,
      orderDate,
      deliveryDate,
      items: updatedItems,
      totals: { subtotal, tax, grandTotal },
    };

    try {
      const res = await apiFetch(`${API}/wheat-purchase-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();

      if (res.ok) {
        alert('✅ Purchase Order created successfully!');
        console.log('Created Order:', data);

        // Reset form
        setSupplier(suppliers[0]?._id || '');
        setOrderDate(new Date().toISOString().slice(0, 10));
        setDeliveryDate(
          new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().slice(0, 10)
        );
        setItems(products[0]?._id ? [{ productId: products[0]._id, quantity: 1, rate: 0 }] : []);
      } else {
        alert('❌ Failed to create order: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Server error while creating order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Create Wheat Purchase Order">
      <div className="max-w-6xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-slate-50 p-8 rounded-xl border border-slate-200 shadow-sm space-y-8"
        >
          {/* Header Fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label htmlFor="orderNo" className="block text-sm font-medium text-slate-700">
                P.O. No.
              </label>
              <input
                type="text"
                id="orderNo"
                value={orderNo}
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                disabled
              />
            </div>

            <div>
              <label htmlFor="supplier" className="block text-sm font-medium text-slate-700">
                Supplier
              </label>
              <select
                id="supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                required
              >
                {suppliers.length === 0 ? (
                  <option>Loading suppliers...</option>
                ) : (
                  suppliers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.supplierName}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label htmlFor="orderDate" className="block text-sm font-medium text-slate-700">
                Order Date
              </label>
              <input
                type="date"
                id="orderDate"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="deliveryDate" className="block text-sm font-medium text-slate-700">
                Expected Delivery
              </label>
              <input
                type="date"
                id="deliveryDate"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"
                required
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-2">Order Items</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">
                      Quantity (Tons)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-40">
                      Rate / Ton (Rs.)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-40">
                      Amount (Rs.)
                    </th>
                    <th className="w-16"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                          className="w-full text-sm border-slate-300 rounded-md"
                        >
                          {(products.length === 0 ? [] : products).map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.productName}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full text-sm border-slate-300 rounded-md"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                          className="w-full text-sm border-slate-300 rounded-md"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={(item.quantity * item.rate).toFixed(2)}
                          className="w-full text-sm bg-slate-100 border-slate-300 rounded-md"
                          disabled
                        />
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded-md disabled:opacity-50"
                          disabled={items.length <= 1}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="mt-4 py-2 px-4 border border-dashed border-primary text-primary rounded-md text-sm font-medium hover:bg-blue-50 cursor-pointer"
            >
              + Add Another Item
            </button>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-full md:w-1/3 space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-slate-600">Subtotal:</span>
                <span className="font-semibold text-slate-800">Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-lg font-bold text-slate-800">Grand Total:</span>
                <span className="text-lg font-bold text-slate-800">Rs. {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end pt-6 border-t">
            <button
              type="button"
              className="bg-white py-2 px-6 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`ml-3 inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading ? 'bg-blue-300' : 'bg-primary hover:bg-blue-800'
              }`}
            >
              {loading ? 'Saving...' : 'Create Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
};

export default WheatPurchaseOrder;
