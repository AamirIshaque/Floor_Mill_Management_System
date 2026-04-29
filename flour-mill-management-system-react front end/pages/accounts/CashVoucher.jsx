import React, { useState, useEffect } from 'react';
import PageShell from '../../components/PageShell';
import apiFetch from '../../utils/apiFetch';

const CashVoucher = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  
  const [transactionType, setTransactionType] = useState('payment'); // 'payment' or 'receipt'
  const [accounts, setAccounts] = useState([]);
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().slice(0, 10));
  const [cashAccount, setCashAccount] = useState('');
  const [partyName, setPartyName] = useState('');
  const [amount, setAmount] = useState('');
  const [accountHead, setAccountHead] = useState('');
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
        // Set default cash account
        if (data.length > 0) {
          const cashAccounts = data.filter(acc => acc.type === 'Asset' && acc.name.toLowerCase().includes('cash'));
          if (cashAccounts.length > 0) {
            setCashAccount(cashAccounts[0]._id);
          }
          // Set default account head based on transaction type
          updateDefaultAccountHead(data, transactionType);
        }
      }
    } catch (e) {
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const updateDefaultAccountHead = (accountsList, txType) => {
    if (accountsList.length === 0) return;
    
    if (txType === 'payment') {
      const expenseAccounts = accountsList.filter(acc => acc.type === 'Expense');
      if (expenseAccounts.length > 0) {
        setAccountHead(expenseAccounts[0]._id);
      }
    } else {
      const incomeAccounts = accountsList.filter(acc => acc.type === 'Income');
      if (incomeAccounts.length > 0) {
        setAccountHead(incomeAccounts[0]._id);
      }
    }
  };

  const handleTransactionTypeChange = (type) => {
    setTransactionType(type);
    updateDefaultAccountHead(accounts, type);
    setPartyName('');
    setAmount('');
    setNarration('');
    setError('');
    setSuccess('');
  };

  const generateVoucherNumber = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const prefix = transactionType === 'payment' ? 'CPV' : 'CRV';
    return `${prefix}-${year}${month}${day}-001`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cashAccount || !accountHead || !amount || !partyName || !narration) {
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

      let voucherLines;
      if (transactionType === 'payment') {
        // Cash Payment: Debit Expense, Credit Cash
        voucherLines = [
          {
            account: accountHead,
            narration: narration,
            debit: numAmount,
            credit: 0
          },
          {
            account: cashAccount,
            narration: narration,
            debit: 0,
            credit: numAmount
          }
        ];
      } else {
        // Cash Receipt: Debit Cash, Credit Income
        voucherLines = [
          {
            account: cashAccount,
            narration: narration,
            debit: numAmount,
            credit: 0
          },
          {
            account: accountHead,
            narration: narration,
            debit: 0,
            credit: numAmount
          }
        ];
      }

      const voucherData = {
        type: transactionType === 'payment' ? 'CPV' : 'CRV',
        number: generateVoucherNumber(),
        date: voucherDate,
        narration: narration,
        lines: voucherLines
      };

      const res = await apiFetch(`${API}/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`Cash ${transactionType === 'payment' ? 'Payment' : 'Receipt'} Voucher created successfully!`);
        // Reset form
        setPartyName('');
        setAmount('');
        setNarration('');
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
  const accountHeadOptions = transactionType === 'payment'
    ? accounts.filter(acc => acc.type === 'Expense')
    : accounts.filter(acc => acc.type === 'Income');

  return (
    <PageShell title="Cash Voucher">
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
        {/* Transaction Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">Transaction Type</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleTransactionTypeChange('payment')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                transactionType === 'payment'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              💸 Cash Payment
            </button>
            <button
              type="button"
              onClick={() => handleTransactionTypeChange('receipt')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                transactionType === 'receipt'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              💰 Cash Receipt
            </button>
          </div>
        </div>

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
            <label htmlFor="partyName" className="block text-sm font-medium text-slate-700">
              {transactionType === 'payment' ? 'Payment To' : 'Received From'} *
            </label>
            <input
              type="text"
              id="partyName"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder={transactionType === 'payment' ? 'Enter name of the recipient' : 'Enter name of the payer'}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="cashAccount" className="block text-sm font-medium text-slate-700">
                Cash Account *
              </label>
              <select
                id="cashAccount"
                value={cashAccount}
                onChange={(e) => setCashAccount(e.target.value)}
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
            <label htmlFor="accountHead" className="block text-sm font-medium text-slate-700">
              {transactionType === 'payment' ? 'Expense Head' : 'Income Head'} *
            </label>
            <select
              id="accountHead"
              value={accountHead}
              onChange={(e) => setAccountHead(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
              required
            >
              <option value="">Select Account...</option>
              {accountHeadOptions.map(account => (
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
              placeholder={transactionType === 'payment' 
                ? 'A brief description of the payment (e.g., Office rent for July 2024)' 
                : 'A brief description of the receipt (e.g., Cash sale of wheat)'}
              required
            />
          </div>

          {/* Voucher Preview */}
          {amount && cashAccount && accountHead && (
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
                    {transactionType === 'payment' ? (
                      <>
                        <tr>
                          <td className="px-4 py-2 text-sm font-medium">
                            {getAccountDisplayName(accountHead)}
                          </td>
                          <td className="px-4 py-2 text-sm">{narration}</td>
                          <td className="px-4 py-2 text-sm text-right font-medium text-blue-600">
                            {parseFloat(amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm text-right">-</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-sm font-medium">
                            {getAccountDisplayName(cashAccount)}
                          </td>
                          <td className="px-4 py-2 text-sm">{narration}</td>
                          <td className="px-4 py-2 text-sm text-right">-</td>
                          <td className="px-4 py-2 text-sm text-right font-medium text-red-600">
                            {parseFloat(amount).toFixed(2)}
                          </td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr>
                          <td className="px-4 py-2 text-sm font-medium">
                            {getAccountDisplayName(cashAccount)}
                          </td>
                          <td className="px-4 py-2 text-sm">{narration}</td>
                          <td className="px-4 py-2 text-sm text-right font-medium text-blue-600">
                            {parseFloat(amount).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm text-right">-</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-sm font-medium">
                            {getAccountDisplayName(accountHead)}
                          </td>
                          <td className="px-4 py-2 text-sm">{narration}</td>
                          <td className="px-4 py-2 text-sm text-right">-</td>
                          <td className="px-4 py-2 text-sm text-right font-medium text-red-600">
                            {parseFloat(amount).toFixed(2)}
                          </td>
                        </tr>
                      </>
                    )}
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
                setPartyName('');
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

export default CashVoucher;
