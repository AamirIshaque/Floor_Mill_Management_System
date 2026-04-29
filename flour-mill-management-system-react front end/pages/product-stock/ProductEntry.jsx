import React, { useState, useEffect } from 'react';
import PageShell from '../../components/PageShell';
import ErrorBanner from '../../components/ErrorBanner';
import apiFetch from '../../utils/apiFetch';
import { useSharedData } from '../../context/DataProvider';

const ProductEntry = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const { refresh } = useSharedData();
  const [products, setProducts] = useState([]); // Product list
  const [editingId, setEditingId] = useState('');
  const [productName, setProductName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [category, setCategory] = useState('Flour');
  const [uom, setUom] = useState('Bag');
  const [packingSize, setPackingSize] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [openingStock, setOpeningStock] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`${API}/products`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Failed to load products');
      } else {
        setProducts(data);
        setError('');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Reset form fields
  const handleReset = () => {
    setEditingId('');
    setProductName('');
    setProductCode('');
    setCategory('Flour');
    setUom('Bag');
    setPackingSize('');
    setSalePrice('');
    setOpeningStock('0');
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newProduct = {
      productName,
      productCode,
      category,
      uom,
      packingSize: parseFloat(packingSize) || 0,
      salePrice: parseFloat(salePrice) || 0,
      openingStock: parseFloat(openingStock) || 0,
    };

    try {
      const url = editingId ? `${API}/products/${editingId}` : `${API}/products`;
      const method = editingId ? 'PUT' : 'POST';
      const response = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        alert(editingId ? '✅ Product updated successfully!' : '✅ Product saved successfully!');
        handleReset();
        fetchProducts(); // refresh product list
        await refresh(); // refresh shared data provider
      } else {
        const err = await response.json();
        const msg = err.message || 'Failed to save product';
        setError(msg);
        alert(`❌ ${msg}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Server error while saving product');
      alert('❌ Server error while saving product');
    }
  };

  // ✅ Handle product deletion
  const handleDelete = async (productId, productName) => {
    const confirmDelete = window.confirm(
      `⚠️ Are you sure you want to delete "${productName}"?\n\nThis action cannot be undone and will remove all associated stock transactions.`
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);
      const response = await apiFetch(`${API}/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('✅ Product deleted successfully!');
        fetchProducts(); // refresh product list
        await refresh(); // refresh shared data provider
      } else {
        const err = await response.json();
        const msg = err.message || 'Failed to delete product';
        setError(msg);
        alert(`❌ ${msg}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Server error while deleting product');
      alert('❌ Server error while deleting product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Food Products & Inventory Management">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Food Products & Raw Materials</h1>
        <p className="text-slate-600 mt-1">Manage flour, grains, bran, packaging, and other inventory products that affect stock levels</p>
      </div>
      <ErrorBanner message={error} onClose={()=>setError('')} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ---------------- Form Section ---------------- */}
        <div className="md:col-span-1 bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">
            {editingId ? 'Edit Food Product' : 'Add New Food Product'}
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-slate-700">
                Product Name
              </label>
              <input
                type="text"
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., Premium Wheat Flour, Rice Bran, etc."
                required
              />
            </div>

            <div>
              <label htmlFor="productCode" className="block text-sm font-medium text-slate-700">
                Product Code / SKU
              </label>
              <input
                type="text"
                id="productCode"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., FL-AP-50"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              >
                <option>Flour</option>
                <option>Bran</option>
                <option>Semolina</option>
                <option>Bags</option>
                <option>Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="uom" className="block text-sm font-medium text-slate-700">
                  UOM
                </label>
                <select
                  id="uom"
                  value={uom}
                  onChange={(e) => setUom(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                  <option>Bag</option>
                  <option>Kg</option>
                  <option>Ton</option>
                  <option>Pcs</option>
                </select>
              </div>

              <div>
                <label htmlFor="packingSize" className="block text-sm font-medium text-slate-700">
                  Packing Size
                </label>
                <input
                  type="number"
                  id="packingSize"
                  value={packingSize}
                  onChange={(e) => setPackingSize(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="e.g., 50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="salePrice" className="block text-sm font-medium text-slate-700">
                Sale Price (per UOM)
              </label>
              <input
                type="number"
                id="salePrice"
                value={salePrice}
                min="0"
                step="0.01"
                onChange={(e) => setSalePrice(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label htmlFor="openingStock" className="block text-sm font-medium text-slate-700">
                Opening Stock (Qty)
              </label>
              <input
                type="number"
                id="openingStock"
                value={openingStock}
                min="0"
                onChange={(e) => setOpeningStock(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                disabled={!!editingId}
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {editingId ? 'Update Food Product' : 'Save Food Product'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* ---------------- Table Section ---------------- */}
        <div className="md:col-span-2">
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Sale Price (Rs.)</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-6 text-slate-500">Loading...</td></tr>
                ) : products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{product.productCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{product.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{product.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right">
                        {Number(product.salePrice ?? 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(product._id);
                            setProductName(product.productName || '');
                            setProductCode(product.productCode || '');
                            setCategory(product.category || 'Flour');
                            setUom(product.uom || 'Bag');
                            setPackingSize(String(product.packingSize ?? ''));
                            setSalePrice(String(product.salePrice ?? ''));
                            setOpeningStock(String(product.openingStock ?? '0'));
                          }}
                          className="text-primary hover:text-blue-800 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product._id, product.productName)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center py-6 text-slate-500">No products found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default ProductEntry;
