import React from 'react';
import PageShell from '../../../components/PageShell';
const AccountPayable = () => {
  return (
    <PageShell title="Account Payable Report">
<div className="mt-4 p-4 border rounded-md bg-slate-50">
                <p className="text-slate-600 text-center">Report data will be displayed here after selecting a date range and clicking "View Report".</p>
                <p className="text-slate-400 text-center text-sm mt-2">This report provides a detailed view of all money owed to suppliers, including aging analysis.</p>
            </div>
        </PageShell>);

};

export default AccountPayable;
