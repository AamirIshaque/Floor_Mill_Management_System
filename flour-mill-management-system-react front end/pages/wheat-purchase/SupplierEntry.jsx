import React, { useState } from "react";
import PageShell from "../../components/PageShell";
import ErrorBanner from "../../components/ErrorBanner";
import apiFetch from "../../utils/apiFetch";
import { useSharedData } from "../../context/DataProvider";

const SupplierEntry = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const { refresh } = useSharedData();
  const [supplierName, setSupplierName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [accountCode, setAccountCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newSupplier = {
      supplierName,
      contactPerson,
      phone,
      address,
      accountCode
    };

    try {
      const res = await apiFetch(`${API}/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSupplier)
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Supplier saved successfully!");
        console.log("Saved Supplier:", data);
        setSupplierName("");
        setContactPerson("");
        setPhone("");
        setAddress("");
        setAccountCode("");
        setError("");
        await refresh(); // refresh shared data provider
      } else {
        const msg = data.message || 'Failed to save supplier';
        setError(msg);
        alert("❌ Error: " + msg);
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      setError('Server error occurred');
      alert("Server error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Supplier Entry">
      <div className="max-w-4xl mx-auto bg-slate-50 p-8 rounded-lg border border-slate-200">
        <ErrorBanner message={error} onClose={()=>setError('')} />
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Supplier Name</label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"
                placeholder="e.g., Modern Farms"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"
                placeholder="e.g., John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"
                placeholder="e.g., 03001234567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Ledger Account Code</label>
              <input
                type="text"
                value={accountCode}
                onChange={(e) => setAccountCode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"
                placeholder="Auto-generated or e.g., 2011"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"
              placeholder="e.g., 123 Wheat Street, Lahore"
            ></textarea>
          </div>

          <div className="flex justify-end pt-4 border-t mt-6">
            <button
              type="reset"
              className="bg-white py-2 px-4 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setSupplierName("");
                setContactPerson("");
                setPhone("");
                setAddress("");
                setAccountCode("");
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-primary hover:bg-blue-800"
            >
              {loading ? "Saving..." : "Save Supplier"}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
};

export default SupplierEntry;
