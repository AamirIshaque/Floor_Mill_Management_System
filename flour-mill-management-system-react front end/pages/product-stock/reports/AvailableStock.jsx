import React from 'react';
import PageShell from '../../../components/PageShell';

//import Dashboardcard from '../../../components/DashboardCard';

const AvailableStock = () => {
  return (
    <PageShell title="Available Stock Report">
            <div className="mt-4 p-4 border rounded-md bg-slate-50">
                <p className="text-slate-600 text-center">Report data will be displayed here after selecting a date range and clicking "View Report".</p>
                <p className="text-slate-400 text-center text-sm mt-2">This report displays the current stock levels for all products, including quantities on hand and available for sale.</p>
            </div>

        </PageShell>);

};

export default AvailableStock;