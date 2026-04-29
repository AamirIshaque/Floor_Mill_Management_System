import React from 'react';
import PageShell from '../../../components/PageShell';
import apiFetch from '../../../utils/apiFetch';

const DailySales = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [dateType, setDateType] = React.useState('specific'); // 'specific' or 'range'
  const [selectedDate, setSelectedDate] = React.useState('');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [reportData, setReportData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [viewMode, setViewMode] = React.useState('summary'); // 'summary' or 'detailed'

  const loadReport = async () => {
    // Allow loading without dates - will show all sales data
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (dateType === 'specific' && selectedDate) {
        params.append('date', selectedDate);
      } else if (dateType === 'range' && fromDate && toDate) {
        params.append('from', fromDate);
        params.append('to', toDate);
      }
      // If no dates selected, params will be empty and API will return all data

      const res = await apiFetch(`${API}/sales/invoices/daily-report?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setReportData(data);
        setError(''); // Clear any previous errors
      } else {
        const errorMessage = data.message || `Failed to load sales report (${res.status})`;
        setError(errorMessage);
        setReportData(null);
      }
    } catch (e) {
      console.error('Report loading error:', e);
      setError('Failed to load sales report. Please check your connection.');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedDate('');
    setFromDate('');
    setToDate('');
    setReportData(null);
    setError('');
  };

  const handleDateTypeChange = (type) => {
    setDateType(type);
    setSelectedDate('');
    setFromDate('');
    setToDate('');
    setReportData(null);
    setError('');
  };

  const formatCurrency = (amount) => {
    return `Rs. ${new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <PageShell title="Daily Sales Report">
{error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      {reportData && reportData.summary && reportData.summary.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            <strong>Summary:</strong> {reportData.summary.length} days with sales, {reportData.totalRecords || 0} total invoices. 
            Total revenue: <strong>{formatCurrency(reportData.summary.reduce((sum, day) => sum + (day.totalAmount || 0), 0))}</strong>
          </p>
        </div>
      )}
      <div className="mt-4 p-4 border rounded-md bg-white">
        {/* Date Type Selection */}
        <div className="mb-4">
          <div className="flex gap-4 mb-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="dateType"
                value="specific"
                checked={dateType === 'specific'}
                onChange={(e) => handleDateTypeChange(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm font-medium">Specific Date</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="dateType"
                value="range"
                checked={dateType === 'range'}
                onChange={(e) => handleDateTypeChange(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm font-medium">Date Range</span>
            </label>
          </div>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {dateType === 'specific' ? (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
                required
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
              </div>
            </>
          )}
          
          <div className={`flex items-end gap-2 ${dateType === 'specific' ? 'md:col-span-2' : ''}`}>
            <button
              onClick={loadReport}
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </button>
            <button
              onClick={clearFilters}
              className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        {reportData && reportData.summary && reportData.summary.length > 0 && (
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setViewMode('summary')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                viewMode === 'summary'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Summary View
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                viewMode === 'detailed'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Detailed View
            </button>
          </div>
        )}

        {/* Report Content */}
        {!reportData ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">Select dates (optional) and click "Generate Report" to view sales data</p>
            <p className="text-sm mt-2">If no dates are selected, all sales data will be displayed</p>
          </div>
        ) : !reportData.summary || reportData.summary.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No sales data found for the selected period</p>
            <p className="text-sm mt-2">Try selecting a different date range or check if sales invoices exist</p>
          </div>
        ) : viewMode === 'summary' ? (
          /* Summary View */
          <div className="space-y-4">
            {/* Overall Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Overall Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {reportData.summary?.length || 0}
                  </p>
                  <p className="text-sm text-blue-700">Days with Sales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {reportData.totalRecords || 0}
                  </p>
                  <p className="text-sm text-green-700">Total Invoices</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {reportData.summary?.reduce((sum, day) => sum + (day.totalItems || 0), 0) || 0}
                  </p>
                  <p className="text-sm text-purple-700">Items Sold</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(reportData.summary?.reduce((sum, day) => sum + (day.totalAmount || 0), 0) || 0)}
                  </p>
                  <p className="text-sm text-orange-700">Total Revenue</p>
                </div>
              </div>
            </div>

            {/* Daily Summary Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Invoices</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Customers</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Items Sold</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.summary.map((day) => (
                    <tr key={day.date} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">
                        {formatDate(day.date)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {day.totalInvoices}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {day.totalCustomers}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        {day.totalItems}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                        {formatCurrency(day.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Detailed View */
          <div className="space-y-6">
            {reportData.invoices.map((invoice) => (
              <div key={invoice._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-lg font-semibold">
                      Invoice #{invoice.invoiceNo || invoice._id.slice(-6)}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Date: {formatDate(invoice.invoiceDate)} | Customer: {invoice.customer.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(invoice.grandTotal)}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-sm">
                            {item.product.productName} ({item.product.productCode})
                          </td>
                          <td className="px-3 py-2 text-right text-sm">
                            {item.qty} {item.product.uom}
                          </td>
                          <td className="px-3 py-2 text-right text-sm">
                            {formatCurrency(item.rate)}
                          </td>
                          <td className="px-3 py-2 text-right text-sm font-medium">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50">
                        <td colSpan="3" className="px-3 py-2 text-right font-medium">
                          Subtotal:
                        </td>
                        <td className="px-3 py-2 text-right font-medium">
                          {formatCurrency(invoice.subtotal)}
                        </td>
                      </tr>
                      {invoice.tax > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan="3" className="px-3 py-2 text-right font-medium">
                            Tax:
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatCurrency(invoice.tax)}
                          </td>
                        </tr>
                      )}
                      <tr className="bg-blue-50">
                        <td colSpan="3" className="px-3 py-2 text-right font-bold text-blue-800">
                          Grand Total:
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-blue-800">
                          {formatCurrency(invoice.grandTotal)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default DailySales;
