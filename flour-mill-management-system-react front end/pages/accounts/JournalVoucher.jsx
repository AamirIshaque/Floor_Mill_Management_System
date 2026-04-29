import React, { useState, useEffect, useMemo } from 'react';
import PageShell from '../../components/PageShell';
import apiFetch from '../../utils/apiFetch';

const JournalVoucher = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  
  const [accounts, setAccounts] = useState([]);
  const [voucherDate, setVoucherDate] = useState(new Date().toISOString().slice(0, 10));
  const [narration, setNarration] = useState('');
  const [items, setItems] = useState([
    { id: 1, accountId: '', debit: '', credit: '', narration: '' },
    { id: 2, accountId: '', debit: '', credit: '', narration: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  let nextItemId = 3;

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
        // Set default accounts if available
        if (data.length > 0 && items.length >= 2) {
          setItems(prevItems => prevItems.map((item, index) => ({
            ...item,
            accountId: data[index % data.length]._id
          })));
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
    return `JV-${year}${month}${day}-001`;
  };

  const handleItemChange = (id, field, value) => {
    setItems((prevItems) => prevItems.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Ensure debit and credit are mutually exclusive
        if (field === 'debit' && value) updatedItem.credit = '';
        if (field === 'credit' && value) updatedItem.debit = '';
        return updatedItem;
      }
      return item;
    }));
  };

  const handleAddItem = () => {
    const newItem = { 
      id: nextItemId++, 
      accountId: accounts.length > 0 ? accounts[0]._id : '', 
      debit: '', 
      credit: '', 
      narration: '' 
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id) => {
    if (items.length > 2) {
      setItems(items.filter((item) => item.id !== id));
    } else {
      alert("A journal voucher must have at least two entries.");
    }
  };

  const { totalDebit, totalCredit, isBalanced } = useMemo(() => {
    const debit = items.reduce((acc, item) => acc + (parseFloat(item.debit) || 0), 0);
    const credit = items.reduce((acc, item) => acc + (parseFloat(item.credit) || 0), 0);
    return { 
      totalDebit: debit, 
      totalCredit: credit, 
      isBalanced: Math.abs(debit - credit) < 0.01 && debit > 0 
    };
  }, [items]);

  const getAccountDisplayName = (accountId) => {
    const account = accounts.find(acc => acc._id === accountId);
    return account ? `${account.code} - ${account.name}` : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!narration) {
      setError('Overall narration is required');
      return;
    }

    if (!isBalanced) {
      setError("Debits and Credits must be equal before saving.");
      return;
    }

    // Validate all items have accounts and at least one has debit or credit
    const invalidItems = items.filter(item => !item.accountId || (!item.debit && !item.credit));
    if (invalidItems.length > 0) {
      setError('All items must have an account selected and at least one must have a debit or credit amount.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const voucherLines = items.map(item => ({
        account: item.accountId,
        narration: item.narration || narration,
        debit: parseFloat(item.debit) || 0,
        credit: parseFloat(item.credit) || 0
      }));

      const voucherData = {
        type: 'JV',
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
        setSuccess('Journal Voucher created successfully!');
        // Reset form
        setNarration('');
        setItems([
          { id: 1, accountId: accounts.length > 0 ? accounts[0]._id : '', debit: '', credit: '', narration: '' },
          { id: 2, accountId: accounts.length > 0 ? accounts[1 % accounts.length]._id : '', debit: '', credit: '', narration: '' }
        ]);
        nextItemId = 3;
      } else {
        setError(data.message || 'Failed to create voucher');
      }
    } catch (e) {
      setError('Failed to create voucher');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell title="Journal Voucher">
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

      <div className="max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-slate-50 p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
          {/* Header Fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label htmlFor="voucherNo" className="block text-sm font-medium text-slate-700">
                Voucher No.
              </label>
              <input
                type="text"
                id="voucherNo"
                value={generateVoucherNumber()}
                className="mt-1 block w-full px-3 py-2 bg-slate-200 border border-slate-300 rounded-md shadow-sm sm:text-sm"
                readOnly
              />
            </div>
            <div className="md:col-span-1">
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
            <div className="md:col-span-2">
              <label htmlFor="narration" className="block text-sm font-medium text-slate-700">
                Overall Narration *
              </label>
              <input
                type="text"
                id="narration"
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., To record end-of-month adjustments"
                required
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-2">Journal Entries</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Narration
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-40">
                      Debit (Rs.)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-40">
                      Credit (Rs.)
                    </th>
                    <th className="w-16"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-4 text-center text-slate-500">
                        Loading accounts...
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2" style={{ minWidth: '200px' }}>
                          <select 
                            value={item.accountId} 
                            onChange={(e) => handleItemChange(item.id, 'accountId', e.target.value)} 
                            className="w-full text-sm border-slate-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                            required
                          >
                            <option value="">Select Account...</option>
                            {accounts.map((account) => (
                              <option key={account._id} value={account._id}>
                                {account.code} - {account.name} ({account.type})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input 
                            type="text" 
                            value={item.narration} 
                            onChange={(e) => handleItemChange(item.id, 'narration', e.target.value)} 
                            className="w-full text-sm border-slate-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary" 
                            placeholder="Optional line narration"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input 
                            type="number" 
                            min="0" 
                            step="0.01"
                            value={item.debit} 
                            onChange={(e) => handleItemChange(item.id, 'debit', e.target.value)} 
                            className="w-full text-sm border-slate-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary" 
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input 
                            type="number" 
                            min="0" 
                            step="0.01"
                            value={item.credit} 
                            onChange={(e) => handleItemChange(item.id, 'credit', e.target.value)} 
                            className="w-full text-sm border-slate-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary" 
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button 
                            type="button" 
                            onClick={() => handleRemoveItem(item.id)} 
                            className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            disabled={items.length <= 2}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-100">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-right font-bold text-slate-700">
                      Totals
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      {totalDebit.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      {totalCredit.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <button 
              type="button" 
              onClick={handleAddItem} 
              className="mt-4 py-2 px-4 border border-dashed border-primary text-primary rounded-md text-sm font-medium hover:bg-blue-50"
            >
              + Add Row
            </button>
          </div>

          {/* Totals & Status Section */}
          <div className="flex justify-end">
            <div className={`mt-4 p-3 rounded-md text-center font-bold text-lg ${isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isBalanced ? '✅ Totals Match!' : '❌ Totals do not match!'}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-6 border-t">
            <button 
              type="button" 
              className="bg-white py-2 px-6 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setNarration('');
                setItems([
                  { id: 1, accountId: accounts.length > 0 ? accounts[0]._id : '', debit: '', credit: '', narration: '' },
                  { id: 2, accountId: accounts.length > 0 ? accounts[1 % accounts.length]._id : '', debit: '', credit: '', narration: '' }
                ]);
                nextItemId = 3;
                setError('');
                setSuccess('');
              }}
            >
              Reset
            </button>
            <button 
              type="submit" 
              disabled={submitting || !isBalanced || loading}
              className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating Voucher...' : 'Create Journal Voucher'}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
};

export default JournalVoucher;