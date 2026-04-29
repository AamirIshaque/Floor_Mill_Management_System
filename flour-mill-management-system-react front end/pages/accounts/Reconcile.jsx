import React, { useState, useMemo } from 'react';
import PageShell from '../../components/PageShell';

// Mock data to simulate fetching from a backend
const mockLedgerEntries = [
{ id: 'dep-001', date: '2024-07-28', description: 'Cheque from City Bakers', type: 'deposit', amount: 75000 },
{ id: 'pay-001', date: '2024-07-29', description: 'Cheque #123 to Modern Farms', type: 'payment', amount: 150000 },
{ id: 'dep-002', date: '2024-07-30', description: 'Cash Deposit', type: 'deposit', amount: 50000 },
{ id: 'pay-002', date: '2024-07-30', description: 'Cheque #124 for Office Rent', type: 'payment', amount: 45000 }];


const mockBankStatementEntries = [
{ id: 'bank-cr-001', date: '2024-07-31', description: 'Interest Earned', type: 'credit', amount: 1250 },
{ id: 'bank-dr-001', date: '2024-07-31', description: 'Bank Service Charges', type: 'debit', amount: 500 },
{ id: 'bank-dr-002', date: '2024-07-25', description: 'Unknown Debit', type: 'debit', amount: 10000 }];



const Reconcile = () => {
  const [statementDate, setStatementDate] = useState(new Date().toISOString().slice(0, 10));
  const [ledgerBalance, setLedgerBalance] = useState('550000');
  const [statementBalance, setStatementBalance] = useState('675750');

  const [clearedLedgerItems, setClearedLedgerItems] = useState(new Set());
  const [matchedBankItems, setMatchedBankItems] = useState(new Set());

  const handleLedgerItemToggle = (id) => {
    setClearedLedgerItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);else
      newSet.add(id);
      return newSet;
    });
  };

  const handleBankItemToggle = (id) => {
    setMatchedBankItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);else
      newSet.add(id);
      return newSet;
    });
  };

  const reconciliationSummary = useMemo(() => {
    const bookBalance = parseFloat(ledgerBalance) || 0;
    const bankBalance = parseFloat(statementBalance) || 0;

    const unclearedDeposits = mockLedgerEntries.
    filter((item) => item.type === 'deposit' && !clearedLedgerItems.has(item.id)).
    reduce((sum, item) => sum + item.amount, 0);

    const outstandingPayments = mockLedgerEntries.
    filter((item) => item.type === 'payment' && !clearedLedgerItems.has(item.id)).
    reduce((sum, item) => sum + item.amount, 0);

    const unmatchedCredits = mockBankStatementEntries.
    filter((item) => item.type === 'credit' && !matchedBankItems.has(item.id)).
    reduce((sum, item) => sum + item.amount, 0);

    const unmatchedDebits = mockBankStatementEntries.
    filter((item) => item.type === 'debit' && !matchedBankItems.has(item.id)).
    reduce((sum, item) => sum + item.amount, 0);

    const adjustedBankBalance = bankBalance + unclearedDeposits - outstandingPayments;
    const adjustedLedgerBalance = bookBalance + unmatchedCredits - unmatchedDebits;

    const difference = adjustedBankBalance - adjustedLedgerBalance;

    return {
      unclearedDeposits,
      outstandingPayments,
      unmatchedCredits,
      unmatchedDebits,
      adjustedBankBalance,
      adjustedLedgerBalance,
      difference
    };
  }, [ledgerBalance, statementBalance, clearedLedgerItems, matchedBankItems]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reconciliationSummary.difference !== 0) {
      alert('Balances do not match. Please resolve the difference before saving.');
      return;
    }
    console.log("Saving Reconciliation:", {
      statementDate,
      ledgerBalance,
      statementBalance,
      clearedLedgerItems: Array.from(clearedLedgerItems),
      matchedBankItems: Array.from(matchedBankItems),
      summary: reconciliationSummary
    });
    alert('Reconciliation saved successfully!');
  };

  const renderTransactionTable = (title, items, clearedSet, onToggle, typeConfig) =>
  <div className="bg-white p-4 rounded-lg shadow h-full">
            <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">{title}</h3>
            <div className="overflow-y-auto h-72">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="p-2 w-8"><span className="sr-only">Clear</span></th>
                            <th className="p-2 text-left font-medium text-slate-600">Date</th>
                            <th className="p-2 text-left font-medium text-slate-600">Description</th>
                            <th className="p-2 text-right font-medium text-slate-600">{typeConfig.col1}</th>
                            <th className="p-2 text-right font-medium text-slate-600">{typeConfig.col2}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) =>
          <tr key={item.id} className={`border-b hover:bg-slate-50 ${clearedSet.has(item.id) ? 'bg-slate-100 text-slate-400 line-through' : ''}`}>
                                <td className="p-2"><input type="checkbox" className="h-4 w-4 rounded" checked={clearedSet.has(item.id)} onChange={() => onToggle(item.id)} /></td>
                                <td className="p-2 whitespace-nowrap">{item.date}</td>
                                <td className="p-2">{item.description}</td>
                                <td className="p-2 text-right">{item.type === typeConfig.type1 ? item.amount.toFixed(2) : '-'}</td>
                                <td className="p-2 text-right">{item.type === typeConfig.type2 ? item.amount.toFixed(2) : '-'}</td>
                            </tr>
          )}
                    </tbody>
                </table>
            </div>
        </div>;


  return (
    <PageShell title="Bank Reconciliation">
            <form onSubmit={handleSubmit}>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="bankAccount" className="block text-sm font-medium text-slate-700">Bank Account</label>
                        <select id="bankAccount" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                            <option>National Bank - 123456789</option>
                            <option>State Bank - 987654321</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="statementDate" className="block text-sm font-medium text-slate-700">Statement Date</label>
                        <input type="date" id="statementDate" value={statementDate} onChange={(e) => setStatementDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="ledgerBalance" className="block text-sm font-medium text-slate-700">Ledger Balance (Rs.)</label>
                        <input type="number" id="ledgerBalance" value={ledgerBalance} onChange={(e) => setLedgerBalance(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm sm:text-sm" />
                    </div>
                     <div>
                        <label htmlFor="statementBalance" className="block text-sm font-medium text-slate-700">Bank Statement Balance (Rs.)</label>
                        <input type="number" id="statementBalance" value={statementBalance} onChange={(e) => setStatementBalance(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm sm:text-sm" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {renderTransactionTable('Company Ledger Entries (Uncleared)', mockLedgerEntries, clearedLedgerItems, handleLedgerItemToggle, { col1: 'Deposits', col2: 'Payments', type1: 'deposit', type2: 'payment' })}
                    {renderTransactionTable('Bank Statement Entries (Unmatched)', mockBankStatementEntries, matchedBankItems, handleBankItemToggle, { col1: 'Credits', col2: 'Debits', type1: 'credit', type2: 'debit' })}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 bg-slate-100 rounded-lg border">
                    <div className="space-y-2">
                         <h4 className="text-lg font-semibold text-slate-800">Bank Balance Reconciliation</h4>
                         <div className="flex justify-between"><span className="text-slate-600">Bank Statement Balance</span><span>{parseFloat(statementBalance || '0').toFixed(2)}</span></div>
                         <div className="flex justify-between"><span className="text-slate-600">Add: Uncleared Deposits (+)</span><span className="text-green-600">{reconciliationSummary.unclearedDeposits.toFixed(2)}</span></div>
                         <div className="flex justify-between"><span className="text-slate-600">Less: Outstanding Payments (-)</span><span className="text-red-600">{reconciliationSummary.outstandingPayments.toFixed(2)}</span></div>
                         <div className="flex justify-between font-bold border-t pt-2"><span className="text-slate-800">Reconciled Bank Balance</span><span>{reconciliationSummary.adjustedBankBalance.toFixed(2)}</span></div>
                    </div>
                     <div className="space-y-2">
                         <h4 className="text-lg font-semibold text-slate-800">Ledger Balance Reconciliation</h4>
                         <div className="flex justify-between"><span className="text-slate-600">Company Ledger Balance</span><span>{parseFloat(ledgerBalance || '0').toFixed(2)}</span></div>
                         <div className="flex justify-between"><span className="text-slate-600">Add: Unmatched Credits (+)</span><span className="text-green-600">{reconciliationSummary.unmatchedCredits.toFixed(2)}</span></div>
                         <div className="flex justify-between"><span className="text-slate-600">Less: Unmatched Debits (-)</span><span className="text-red-600">{reconciliationSummary.unmatchedDebits.toFixed(2)}</span></div>
                         <div className="flex justify-between font-bold border-t pt-2"><span className="text-slate-800">Reconciled Ledger Balance</span><span>{reconciliationSummary.adjustedLedgerBalance.toFixed(2)}</span></div>
                    </div>
                </div>
                
                <div className="mt-6 p-4 rounded-md text-center text-xl font-bold"
        style={{
          backgroundColor: reconciliationSummary.difference === 0 ? '#ECFDF5' : '#FEF2F2',
          color: reconciliationSummary.difference === 0 ? '#065F46' : '#991B1B'
        }}>
                    {reconciliationSummary.difference === 0 ? 'BALANCED' : `DIFFERENCE: ${reconciliationSummary.difference.toFixed(2)}`}
                </div>

                <div className="flex justify-end pt-6 mt-6 border-t">
                    <button type="submit" className="inline-flex justify-center py-2 px-8 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 disabled:bg-slate-400" disabled={reconciliationSummary.difference !== 0}>
                        Save Reconciliation
                    </button>
                </div>
            </form>
        </PageShell>);

};

export default Reconcile;