import React, { useState, useEffect } from 'react';
import PageShell from '../../../components/PageShell';
import apiFetch from '../../../utils/apiFetch';

const CustomerLedger = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    return firstDayOfMonth.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load customers
    const loadCustomers = async () => {
      try {
        const res = await apiFetch(`${API}/sales/customers`);
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
          if (data.length > 0) setSelectedCustomer(data[0]._id);
        }
      } catch (e) {
        console.error('Failed to load customers:', e);
      }
    };
    loadCustomers();
  }, [API]);

  const loadLedger = async () => {
    if (!selectedCustomer) {
      setError('Please select a customer');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        customerId: selectedCustomer,
        startDate,
        endDate
      });

      const res = await apiFetch(`${API}/sales/invoices/customer-ledger?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setLedgerData(data);
      } else {
        setError(data.message || 'Failed to load customer ledger');
      }
    } catch (e) {
      console.error('Ledger loading error:', e);
      setError('Failed to load customer ledger. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <PageShell title="Customer Ledger">
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-slate-700 mb-1">
                Select Customer
              </label>
              <select
                id="customer"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">Choose a customer...</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <button
                onClick={loadLedger}
                disabled={loading || !selectedCustomer}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'View Ledger'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        {ledgerData && ledgerData.transactions && ledgerData.transactions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-600">
                {ledgerData.transactions.length}
              </p>
              <p className="text-sm text-blue-700">Total Transactions</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(ledgerData.transactions.reduce((sum, t) => sum + t.debit, 0))}
              </p>
              <p className="text-sm text-green-700">Total Debit</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(ledgerData.transactions.reduce((sum, t) => sum + t.credit, 0))}
              </p>
              <p className="text-sm text-red-700">Total Credit</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className={`text-2xl font-bold ${ledgerData.closingBalance >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                {formatCurrency(ledgerData.closingBalance)}
              </p>
              <p className="text-sm text-purple-700">Closing Balance</p>
            </div>
          </div>
        )}

        {/* Ledger Table */}
        {!ledgerData ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Select a customer and date range, then click "View Ledger" to see transaction history.</p>
            <p className="text-sm mt-2">The customer ledger shows all invoices, returns, and payments for the selected customer.</p>
          </div>
        ) : !ledgerData.transactions || ledgerData.transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No transactions found for the selected customer and date range.</p>
            <p className="text-sm mt-2">Try selecting a different date range or customer.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Customer Ledger - {customers.find(c => c._id === selectedCustomer)?.name || 'Unknown Customer'}
              </h3>
              <p className="text-sm text-gray-600">
                Period: {formatDate(startDate)} to {formatDate(endDate)}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Debit
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ledgerData.transactions.map((transaction, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === 'Invoice' ? 'bg-blue-100 text-blue-800' :
                          transaction.type === 'Return' ? 'bg-red-100 text-red-800' :
                          transaction.type === 'Payment' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {transaction.reference || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                        {transaction.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                        {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-green-600">
                        {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-bold">
                        <span className={transaction.balance >= 0 ? 'text-gray-900' : 'text-red-600'}>
                          {formatCurrency(transaction.balance)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default CustomerLedger;
