import React, { useState, useEffect } from 'react';
import PageShell from '../../components/PageShell';
import apiFetch from '../../utils/apiFetch';

const CashPaymentVoucher = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  
  const [accounts, setAccounts] = useState([]);
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().slice(0, 10));
  const [paidFrom, setPaidFrom] = useState('');
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseHead, setExpenseHead] = useState('');
  const [narration, setNarration] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API}/accounts`);
      const data = await res.json();
      if (res.ok) {
        setAccounts(data);
        // Set default values if accounts exist
        if (data.length > 0) {
          // Find cash accounts
          const cashAccounts = data.filter(acc => acc.type === 'Asset' && acc.name.toLowerCase().includes('cash'));
          if (cashAccounts.length > 0) {
            setPaidFrom(cashAccounts[0]._id);
          }
          // Find expense accounts
          const expenseAccounts = data.filter(acc => acc.type === 'Expense');
          if (expenseAccounts.length > 0) {
            setExpenseHead(expenseAccounts[0]._id);
          }
        }
      }
    } catch (e) {
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const generateVoucherNumber = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `CPV-${year}${month}${day}-001`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!paidFrom || !expenseHead || !amount || !payee || !narration) {
      setError('All fields are required');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const voucherData = {
        type: 'CPV',
        number: generateVoucherNumber(),
        date: voucherDate,
        narration: narration,
        lines: [
          {
            account: expenseHead, // Debit expense account
            narration: narration,
            debit: numAmount,
            credit: 0
          },
          {
            account: paidFrom, // Credit cash account
            narration: narration,
            debit: 0,
            credit: numAmount
          }
        ]
      };

      const res = await apiFetch(`${API}/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Cash Payment Voucher created successfully!');
        // Reset form
        setPayee('');
        setAmount('');
        setNarration('');
        // Generate new voucher number for next entry
      } else {
        setError(data.message || 'Failed to create voucher');
      }
    } catch (e) {
      setError('Failed to create voucher');
    } finally {
      setSubmitting(false);
    }
  };

  const getAccountDisplayName = (accountId) => {
    const account = accounts.find(acc => acc._id === accountId);
    return account ? `${account.code} - ${account.name}` : accountId;
  };

  // Filter accounts by type
  const cashAccounts = accounts.filter(acc => acc.type === 'Asset');
  const expenseAccounts = accounts.filter(acc => acc.type === 'Expense');

  return (
    <PageShell title="Cash Payment Voucher">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-slate-50 p-8 rounded-lg border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="voucherNo" className="block text-sm font-medium text-slate-700">
                Voucher No.
              </label>
              <input
                type="text"
                id="voucherNo"
                value={generateVoucherNumber()}
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                disabled
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="voucherDate" className="block text-sm font-medium text-slate-700">
                Date *
              </label>
              <input
                type="date"
                id="voucherDate"
                value={voucherDate}
                onChange={(e) => setVoucherDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="payee" className="block text-sm font-medium text-slate-700">
              Payment To (Payee) *
            </label>
            <input
              type="text"
              id="payee"
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Enter name of the recipient"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="paidFrom" className="block text-sm font-medium text-slate-700">
                Paid From (Cash Account) *
              </label>
              <select
                id="paidFrom"
                value={paidFrom}
                onChange={(e) => setPaidFrom(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                required
              >
                <option value="">Select Cash Account...</option>
                {cashAccounts.map(account => (
                  <option key={account._id} value={account._id}>
                    {account.code} - {account.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-700">
                Amount (Rs.) *
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="expenseHead" className="block text-sm font-medium text-slate-700">
              Expense Head *
            </label>
            <select
              id="expenseHead"
              value={expenseHead}
              onChange={(e) => setExpenseHead(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              required
            >
              <option value="">Select Expense Account...</option>
              {expenseAccounts.map(account => (
                <option key={account._id} value={account._id}>
                  {account.code} - {account.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="narration" className="block text-sm font-medium text-slate-700">
              Narration *
            </label>
            <textarea
              id="narration"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="A brief description of the payment (e.g., Office rent for July 2024)"
              required
            />
          </div>

          {/* Voucher Preview */}
          {amount && paidFrom && expenseHead && (
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-slate-800 mb-3">Voucher Preview</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Account</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Narration</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Debit</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="px-4 py-2 text-sm font-medium">
                        {getAccountDisplayName(expenseHead)}
                      </td>
                      <td className="px-4 py-2 text-sm">{narration}</td>
                      <td className="px-4 py-2 text-sm text-right font-medium text-blue-600">
                        {parseFloat(amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-sm text-right">-</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm font-medium">
                        {getAccountDisplayName(paidFrom)}
                      </td>
                      <td className="px-4 py-2 text-sm">{narration}</td>
                      <td className="px-4 py-2 text-sm text-right">-</td>
                      <td className="px-4 py-2 text-sm text-right font-medium text-red-600">
                        {parseFloat(amount).toFixed(2)}
                      </td>
                    </tr>
                    <tr className="bg-slate-50">
                      <td colSpan="2" className="px-4 py-2 text-right font-semibold">Total</td>
                      <td className="px-4 py-2 text-right font-semibold text-blue-600">
                        {parseFloat(amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-red-600">
                        {parseFloat(amount).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button 
              type="button" 
              className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={() => {
                setPayee('');
                setAmount('');
                setNarration('');
                setError('');
                setSuccess('');
              }}
            >
              Reset
            </button>
            <button 
              type="submit" 
              disabled={submitting || loading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating Voucher...' : 'Create Voucher'}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
};

export default CashPaymentVoucher;