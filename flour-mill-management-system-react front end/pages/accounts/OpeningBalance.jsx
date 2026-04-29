import React, { useState, useMemo } from 'react';
import PageShell from '../../components/PageShell';






const initialAssets = {
  '1010': { name: 'Cash on Hand', balance: { debit: '', credit: '' } },
  '1020': { name: 'National Bank', balance: { debit: '', credit: '' } },
  '1110': { name: 'Accounts Receivable', balance: { debit: '', credit: '' } },
  '1210': { name: 'Machinery', balance: { debit: '', credit: '' } }
};

const initialLiabilities = {
  '2010': { name: 'Accounts Payable', balance: { debit: '', credit: '' } },
  '2110': { name: 'Short Term Loan', balance: { debit: '', credit: '' } },
  '3010': { name: "Owner's Equity", balance: { debit: '', credit: '' } },
  '3020': { name: 'Retained Earnings', balance: { debit: '', credit: '' } }
};

const OpeningBalance = () => {
  const [asOfDate, setAsOfDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [assets, setAssets] = useState(initialAssets);
  const [liabilities, setLiabilities] = useState(initialLiabilities);

  const handleBalanceChange = (
  setState,
  code,
  type,
  value) =>
  {
    setState((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        balance: {
          ...prev[code].balance,
          [type]: value,
          // Clear the other field
          [type === 'debit' ? 'credit' : 'debit']: ''
        }
      }
    }));
  };

  const { totalDebit, totalCredit } = useMemo(() => {
    const allAccounts = { ...assets, ...liabilities };
    let debit = 0;
    let credit = 0;
    Object.values(allAccounts).forEach((acc) => {
      debit += parseFloat(acc.balance.debit) || 0;
      credit += parseFloat(acc.balance.credit) || 0;
    });
    return { totalDebit: debit, totalCredit: credit };
  }, [assets, liabilities]);

  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isBalanced) {
      alert("Opening balances must be equal before saving.");
      return;
    }
    const openingBalanceData = {
      asOfDate,
      assets,
      liabilities,
      totals: { totalDebit, totalCredit }
    };
    console.log("Saving Opening Balances:", openingBalanceData);
    alert("Opening Balances saved successfully! (See console for data)");
  };

  const renderAccountRows = (
  accounts,
  setState) =>
  {
    return Object.entries(accounts).map(([code, { name, balance }]) =>
    <tr key={code}>
                <td className="px-4 py-2 text-sm text-slate-700">{name} ({code})</td>
                <td className="p-2 w-32">
                    <input
          type="number"
          placeholder="0.00"
          value={balance.debit}
          onChange={(e) => handleBalanceChange(setState, code, 'debit', e.target.value)}
          className="w-full text-sm text-right border-slate-300 rounded-md" />

                </td>
                <td className="p-2 w-32">
                    <input
          type="number"
          placeholder="0.00"
          value={balance.credit}
          onChange={(e) => handleBalanceChange(setState, code, 'credit', e.target.value)}
          className="w-full text-sm text-right border-slate-300 rounded-md" />

                </td>
            </tr>
    );
  };

  return (
    <PageShell title="Enter Opening Balances">
            <form onSubmit={handleSubmit}>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <label htmlFor="asOfDate" className="text-sm font-medium text-slate-700">Balances as of:</label>
                        <input
              type="date"
              id="asOfDate"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-sm"
              required />

                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Assets Column */}
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">Assets</h3>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Account</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Debit</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Credit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderAccountRows(assets, setAssets)}
                            </tbody>
                        </table>
                    </div>
                    {/* Liabilities & Equity Column */}
                     <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">Liabilities & Owner's Equity</h3>
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Account</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Debit</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Credit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderAccountRows(liabilities, setLiabilities)}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t">
                    <div className="max-w-md mx-auto bg-white p-4 rounded-lg shadow">
                         <div className="flex justify-between text-lg font-semibold">
                            <span className="text-slate-600">Total Debits:</span>
                            <span className="text-slate-800">Rs. {totalDebit.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold mt-2">
                            <span className="text-slate-600">Total Credits:</span>
                            <span className="text-slate-800">Rs. {totalCredit.toFixed(2)}</span>
                        </div>
                        <div className={`mt-4 p-3 rounded-md text-center font-bold text-lg ${isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {isBalanced ? 'Totals Match!' : 'Totals do not match!'}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 mt-6">
                    <button type="submit" className="inline-flex justify-center py-2 px-8 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 disabled:bg-slate-400" disabled={!isBalanced}>
                        Save Opening Balances
                    </button>
                </div>
            </form>
        </PageShell>);

};

export default OpeningBalance;