import React, { useState, useEffect, useMemo } from 'react';
import PageShell from '../../components/PageShell';
import apiFetch from '../../utils/apiFetch';

const VoucherPosting = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  
  const [vouchers, setVouchers] = useState([]);
  const [selectedVouchers, setSelectedVouchers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter states
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [voucherTypeFilter, setVoucherTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Draft');

  const voucherTypes = ['All', 'CPV', 'BPV', 'CRV', 'BRV', 'JV'];

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`${API}/vouchers`);
      const data = await res.json();
      if (res.ok) {
        setVouchers(data);
        setError('');
      } else {
        setError(data.message || 'Failed to load vouchers');
      }
    } catch (e) {
      setError('Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  };

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      const voucherDate = new Date(v.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end day

      const dateMatch = voucherDate >= start && voucherDate <= end;
      const typeMatch = voucherTypeFilter === 'All' || v.type === voucherTypeFilter;
      const statusMatch = statusFilter === 'All' || v.status === statusFilter;

      return dateMatch && typeMatch && statusMatch;
    });
  }, [vouchers, startDate, endDate, voucherTypeFilter, statusFilter]);

  const handleSelect = (id) => {
    setSelectedVouchers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const draftIds = filteredVouchers
        .filter((v) => v.status === 'Draft')
        .map((v) => v._id);
      setSelectedVouchers(new Set(draftIds));
    } else {
      setSelectedVouchers(new Set());
    }
  };

  const handlePostVouchers = async () => {
    if (selectedVouchers.size === 0) {
      alert('Please select at least one voucher to post.');
      return;
    }

    const confirmation = window.confirm(`Are you sure you want to post ${selectedVouchers.size} selected voucher(s)? This action cannot be undone.`);

    if (!confirmation) return;

    try {
      setPosting(true);
      setError('');
      setSuccess('');

      // Post vouchers one by one (since the API expects individual voucher IDs)
      const postPromises = Array.from(selectedVouchers).map(voucherId =>
        apiFetch(`${API}/vouchers/${voucherId}/post`, {
          method: 'POST'
        })
      );

      const results = await Promise.allSettled(postPromises);
      const successful = results.filter(result => result.status === 'fulfilled' && result.value.ok).length;
      const failed = results.length - successful;

      if (successful > 0) {
        setSuccess(`${successful} voucher(s) posted successfully${failed > 0 ? `, ${failed} failed` : ''}.`);
        setSelectedVouchers(new Set());
        await loadVouchers(); // Reload to get updated status
      } else {
        setError('Failed to post any vouchers. Please try again.');
      }
    } catch (e) {
      setError('Failed to post vouchers');
    } finally {
      setPosting(false);
    }
  };

  const getTypeDisplayName = (type) => {
    const typeMap = {
      'CPV': 'Cash Payment',
      'BPV': 'Bank Payment',
      'CRV': 'Cash Receive',
      'BRV': 'Bank Receive',
      'JV': 'Journal Voucher'
    };
    return typeMap[type] || type;
  };

  const calculateTotalAmount = (lines) => {
    return lines.reduce((total, line) => total + (line.debit || 0), 0);
  };

  const isAllSelected = filteredVouchers.length > 0 &&
    filteredVouchers.filter((v) => v.status === 'Draft').length > 0 &&
    filteredVouchers.filter((v) => v.status === 'Draft').length === selectedVouchers.size;

  return (
    <PageShell title="Voucher Posting to General Ledger">
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

      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="startDate" className="text-sm font-medium text-slate-700">From:</label>
          <input 
            type="date" 
            id="startDate" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="form-input" 
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="endDate" className="text-sm font-medium text-slate-700">To:</label>
          <input 
            type="date" 
            id="endDate" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="form-input" 
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="voucherTypeFilter" className="text-sm font-medium text-slate-700">Type:</label>
          <select 
            id="voucherTypeFilter" 
            value={voucherTypeFilter} 
            onChange={(e) => setVoucherTypeFilter(e.target.value)} 
            className="form-select"
          >
            {voucherTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="statusFilter" className="text-sm font-medium text-slate-700">Status:</label>
          <select 
            id="statusFilter" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="form-select"
          >
            <option value="Draft">Draft</option>
            <option value="Posted">Posted</option>
            <option value="All">All</option>
          </select>
        </div>
        <button 
          onClick={loadVouchers}
          disabled={loading}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left w-12">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded"
                  onChange={handleSelectAll}
                  checked={isAllSelected}
                  disabled={statusFilter === 'Posted'}
                />
              </th>
              <th className="th-cell">Date</th>
              <th className="th-cell">Voucher No.</th>
              <th className="th-cell">Type</th>
              <th className="th-cell">Narration</th>
              <th className="th-cell text-right">Amount (Rs.)</th>
              <th className="th-cell text-center">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-slate-500">
                  Loading vouchers...
                </td>
              </tr>
            ) : filteredVouchers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-slate-500">
                  No vouchers found for the selected criteria.
                </td>
              </tr>
            ) : (
              filteredVouchers.map((v) => (
                <tr key={v._id} className={`hover:bg-slate-50 ${selectedVouchers.has(v._id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4">
                    {v.status === 'Draft' && (
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded"
                        checked={selectedVouchers.has(v._id)}
                        onChange={() => handleSelect(v._id)}
                      />
                    )}
                  </td>
                  <td className="td-cell">
                    {new Date(v.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="td-cell font-medium text-slate-900">{v.number}</td>
                  <td className="td-cell">{getTypeDisplayName(v.type)}</td>
                  <td className="td-cell max-w-sm truncate">{v.narration}</td>
                  <td className="td-cell text-right">
                    {calculateTotalAmount(v.lines).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="td-cell text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      v.status === 'Posted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t">
        <p className="text-sm text-slate-600">
          {selectedVouchers.size} voucher(s) selected for posting.
        </p>
        <button
          onClick={handlePostVouchers}
          disabled={selectedVouchers.size === 0 || posting}
          className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {posting ? 'Posting...' : 'Post Selected Vouchers'}
        </button>
      </div>

      <style>{`
        .form-input, .form-select {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          background-color: white;
          border: 1px solid #cbd5e1;
          border-radius: 0.375rem;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          font-size: 0.875rem;
        }
        .form-select {
          padding-right: 2.5rem;
        }
        .th-cell {
          padding: 0.75rem 1.5rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 500;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .td-cell {
          padding: 1rem 1.5rem;
          white-space: nowrap;
          font-size: 0.875rem;
          color: #334155;
        }
      `}</style>
    </PageShell>
  );
};

export default VoucherPosting;