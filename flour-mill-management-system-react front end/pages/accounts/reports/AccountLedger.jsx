import React, { useState, useEffect, useMemo } from 'react';
import PageShell from '../../../components/PageShell';
import apiFetch from '../../../utils/apiFetch';

const AccountLedger = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState('');
  const [openingBalance, setOpeningBalance] = useState(0);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const res = await apiFetch(`${API}/accounts`);
      const data = await res.json();
      if (res.ok) {
        setAccounts(data);
        if (data.length > 0) setAccountId(data[0]._id);
      } else {
        setError('Failed to load accounts');
      }
    } catch (e) {
      setError('Failed to load accounts');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const loadLedger = async () => {
    if (!accountId) {
      setError('Please select an account');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({ accountId });
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);

      const res = await apiFetch(`${API}/vouchers/reports/account-ledger?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        // Calculate running balance for each transaction
        let balance = openingBalance;
        const processedTransactions = data.map(transaction => {
          const debit = transaction.lines?.debit || 0;
          const credit = transaction.lines?.credit || 0;
          
          // Update balance based on transaction type
          if (debit > 0) {
            balance += debit;
          } else if (credit > 0) {
            balance -= credit;
          }

          return {
            ...transaction,
            debit: debit,
            credit: credit,
            balance: balance,
            displayDate: new Date(transaction.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
          };
        });

        setTransactions(processedTransactions);
      } else {
        setError(data.message || 'Failed to load ledger data');
        setTransactions([]);
      }
    } catch (e) {
      console.error('Ledger loading error:', e);
      setError('Failed to load ledger data');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setTransactions([]);
    setError('');
  };

  const selectedAccount = accounts.find(acc => acc._id === accountId);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
    const netChange = totalDebit - totalCredit;
    const closingBalance = openingBalance + netChange;

    return {
      totalDebit,
      totalCredit,
      netChange,
      closingBalance,
      transactionCount: transactions.length
    };
  }, [transactions, openingBalance]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'CPV': return 'bg-blue-100 text-blue-800';
      case 'BPV': return 'bg-purple-100 text-purple-800';
      case 'CRV': return 'bg-green-100 text-green-800';
      case 'BRV': return 'bg-teal-100 text-teal-800';
      case 'JV': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeDisplayName = (type) => {
    const typeMap = {
      'CPV': 'Cash Payment',
      'BPV': 'Bank Payment',
      'CRV': 'Cash Receive',
      'BRV': 'Bank Receive',
      'JV': 'Journal Voucher'
    };
    return typeMap[type] || type;
  };

  return (
    <PageShell title="Account Ledger Report">
{error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="mt-4 p-4 border rounded-md bg-white">
        {/* Account Selection and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Account *
            </label>
            <select 
              value={accountId} 
              onChange={(e) => setAccountId(e.target.value)} 
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-primary focus:border-primary"
              disabled={loadingAccounts}
            >
              <option value="">
                {loadingAccounts ? 'Loading accounts...' : 'Select Account...'}
              </option>
              {accounts.map(account => (
                <option key={account._id} value={account._id}>
                  {account.code} - {account.name} ({account.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input 
              type="date" 
              value={fromDate} 
              onChange={(e) => setFromDate(e.target.value)} 
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-primary focus:border-primary" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input 
              type="date" 
              value={toDate} 
              onChange={(e) => setToDate(e.target.value)} 
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-primary focus:border-primary" 
            />
          </div>

          <div className="flex items-end gap-2">
            <button 
              onClick={loadLedger}
              disabled={loading || !accountId}
              className="px-4 py-2 bg-primary text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Generate Ledger'}
            </button>
            <button 
              onClick={clearFilters}
              className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Account Information */}
        {selectedAccount && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              {selectedAccount.code} - {selectedAccount.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-700">Type:</span>
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(selectedAccount.type)}`}>
                  {selectedAccount.type}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Status:</span>
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedAccount.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedAccount.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Parent:</span>
                <span className="ml-2">{selectedAccount.parentCode || 'None'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {transactions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {summary.transactionCount}
              </div>
              <div className="text-sm text-blue-700">Total Transactions</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {summary.totalDebit.toFixed(2)}
              </div>
              <div className="text-sm text-green-700">Total Debits</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {summary.totalCredit.toFixed(2)}
              </div>
              <div className="text-sm text-red-700">Total Credits</div>
            </div>
            <div className={`p-4 rounded-lg border ${
              summary.closingBalance >= 0 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className={`text-2xl font-bold ${
                summary.closingBalance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {summary.closingBalance.toFixed(2)}
              </div>
              <div className={`text-sm ${
                summary.closingBalance >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                Closing Balance
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Voucher Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Voucher No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Narration
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Loading ledger data...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    {accountId ? 'No transactions found for the selected account and date range.' : 'Please select an account to view the ledger.'}
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.displayDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                        {getTypeDisplayName(transaction.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {transaction.lines?.narration || transaction.narration || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-blue-600">
                      {transaction.debit > 0 ? transaction.debit.toFixed(2) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                      {transaction.credit > 0 ? transaction.credit.toFixed(2) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">
                      <span className={transaction.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {transaction.balance.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        {transactions.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Period Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Opening Balance:</span>
                <span className="ml-2 font-semibold">{openingBalance.toFixed(2)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Debits:</span>
                <span className="ml-2 font-semibold text-blue-600">+{summary.totalDebit.toFixed(2)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Credits:</span>
                <span className="ml-2 font-semibold text-red-600">-{summary.totalCredit.toFixed(2)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Net Change:</span>
                <span className={`ml-2 font-semibold ${summary.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.netChange >= 0 ? '+' : ''}{summary.netChange.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-gray-700">Closing Balance:</span>
                <span className={`text-xl font-bold ${summary.closingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.closingBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default AccountLedger;
