import React from 'react';
import PageShell from '../../../components/PageShell';
const ProfitAndLoss = () => {
  return (
    <PageShell title="Profit and Loss Statement">
<div className="mt-4 p-4 border rounded-md bg-slate-50">
                <p className="text-slate-600 text-center">Report data will be displayed here after selecting a date range and clicking "View Report".</p>
                <p className="text-slate-400 text-center text-sm mt-2">This financial report summarizes the revenues, costs, and expenses incurred during a specified period.</p>
            </div>
        </PageShell>);

};

export default ProfitAndLoss;
