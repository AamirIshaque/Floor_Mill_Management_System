import React from "react";
import { Link } from "react-router-dom";
import apiFetch from "../utils/apiFetch";

const Dashboard = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [stats, setStats] = React.useState({ products: 0, suppliers: 0, invoicesToday: 0, purchasesToday: 0 });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [prodRes, suppRes, invRes, gpRes] = await Promise.all([
          apiFetch(`${API}/products`),
          apiFetch(`${API}/suppliers`),
          apiFetch(`${API}/sales/invoices`),
          apiFetch(`${API}/purchases/general`)
        ]);
        const [products, suppliers, invoices, purchases] = await Promise.all([
          prodRes.json(), suppRes.json(), invRes.json(), gpRes.json()
        ]);
        const todayStr = new Date().toISOString().slice(0,10);
        const invoicesToday = Array.isArray(invoices) ? invoices.filter(x => (x.invoiceDate || x.createdAt || '').slice(0,10) === todayStr).length : 0;
        const purchasesToday = Array.isArray(purchases) ? purchases.filter(x => (x.purchaseDate || x.createdAt || '').slice(0,10) === todayStr).length : 0;
        setStats({
          products: Array.isArray(products) ? products.length : 0,
          suppliers: Array.isArray(suppliers) ? suppliers.length : 0,
          invoicesToday,
          purchasesToday,
        });
      } catch (e) {
        // swallow, keep defaults
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [API]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-500">Products</p>
          <p className="text-2xl font-semibold">{loading ? '…' : stats.products}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-500">Suppliers</p>
          <p className="text-2xl font-semibold">{loading ? '…' : stats.suppliers}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-500">Invoices Today</p>
          <p className="text-2xl font-semibold">{loading ? '…' : stats.invoicesToday}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-500">Purchases Today</p>
          <p className="text-2xl font-semibold">{loading ? '…' : stats.purchasesToday}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/wheat-purchase/supplier-entry" className="px-3 py-2 text-sm rounded border border-slate-300 hover:bg-slate-50">New Supplier</Link>
          <Link to="/product-stock/product-entry" className="px-3 py-2 text-sm rounded border border-slate-300 hover:bg-slate-50">New Product</Link>
          <Link to="/sales/sales-invoice" className="px-3 py-2 text-sm rounded border border-slate-300 hover:bg-slate-50">Create Invoice</Link>
          <Link to="/general-purchase/purchase" className="px-3 py-2 text-sm rounded border border-slate-300 hover:bg-slate-50">Record Purchase</Link>
          <Link to="/wheat-purchase/reports/purchase-book" className="px-3 py-2 text-sm rounded border border-slate-300 hover:bg-slate-50">Purchase Book</Link>
          <Link to="/product-stock/reports/available-stock" className="px-3 py-2 text-sm rounded border border-slate-300 hover:bg-slate-50">Available Stock</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;