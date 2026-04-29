import React from 'react';
import PageShell from '../../../components/PageShell';
const BalanceSheet = () => {
  return (
    <PageShell title="Balance Sheet">
<div className="mt-4 p-4 border rounded-md bg-slate-50">
                <p className="text-slate-600 text-center">Report data will be displayed here after selecting a date range and clicking "View Report".</p>
                <p className="text-slate-400 text-center text-sm mt-2">This financial statement reports a company's assets, liabilities, and shareholder equity at a specific point in time.</p>
            </div>
        </PageShell>);

};

export default BalanceSheet;
