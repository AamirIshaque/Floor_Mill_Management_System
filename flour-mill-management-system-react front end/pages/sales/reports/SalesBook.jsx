import React from 'react';
import PageShell from '../../../components/PageShell';
const SalesBook = () => {
  return (
    <PageShell title="Sales Book">
<div className="mt-4 p-4 border rounded-md bg-slate-50">
                <p className="text-slate-600 text-center">Report data will be displayed here after selecting a date range and clicking "View Report".</p>
                <p className="text-slate-400 text-center text-sm mt-2">This report provides a comprehensive log of all sales invoices over a selected period.</p>
            </div>
        </PageShell>);

};

export default SalesBook;
