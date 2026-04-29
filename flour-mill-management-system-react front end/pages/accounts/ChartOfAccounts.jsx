import React, { useState, useEffect } from 'react';
import PageShell from '../../components/PageShell';
import apiFetch from '../../utils/apiFetch';

const ChartOfAccounts = () => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [accountCode, setAccountCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('Asset');
  const [parentCode, setParentCode] = useState('');
  const [description, setDescription] = useState('');

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
        setError('');
      } else {
        setError(data.message || 'Failed to load accounts');
      }
    } catch (e) {
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!accountCode || !accountName) {
      setError('Account code and name are required');
      return;
    }

    // Check for duplicate account codes on frontend
    const trimmedCode = accountCode.trim();
    const duplicateAccount = accounts.find(acc => acc.code.toLowerCase() === trimmedCode.toLowerCase());
    if (duplicateAccount) {
      setError(`Account code "${trimmedCode}" already exists (Account: ${duplicateAccount.name})`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const accountData = {
        code: trimmedCode,
        name: accountName.trim(),
        type: accountType,
        parentCode: parentCode.trim() || undefined,
        description: description.trim() || undefined
      };

      const res = await apiFetch(`${API}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Account created successfully!');
        // Reset form
        setAccountCode('');
        setAccountName('');
        setAccountType('Asset');
        setParentCode('');
        setDescription('');
        // Reload accounts list
        await loadAccounts();
      } else {
        setError(data.message || 'Failed to create account');
      }
    } catch (e) {
      setError('Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Asset': return 'bg-green-100 text-green-800';
      case 'Liability': return 'bg-red-100 text-red-800';
      case 'Equity': return 'bg-blue-100 text-blue-800';
      case 'Income': return 'bg-purple-100 text-purple-800';
      case 'Expense': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to find duplicate account codes
  const findDuplicates = () => {
    const codeCount = {};
    const duplicates = new Set();
    
    accounts.forEach(account => {
      const code = account.code.toLowerCase();
      codeCount[code] = (codeCount[code] || 0) + 1;
      if (codeCount[code] > 1) {
        duplicates.add(account.code);
      }
    });
    
    return duplicates;
  };

  const duplicateCodes = findDuplicates();

  return (
    <PageShell title="Chart of Accounts">
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

      {/* Duplicate Accounts Warning */}
      {duplicateCodes.size > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Duplicate Account Codes Detected</h4>
          <p className="text-sm text-yellow-700 mb-2">
            The following account codes appear multiple times and should be resolved:
          </p>
          <div className="flex flex-wrap gap-2">
            {Array.from(duplicateCodes).map(code => (
              <span key={code} className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-medium rounded">
                {code}
              </span>
            ))}
          </div>
          <p className="text-xs text-yellow-600 mt-2">
            Consider merging or removing duplicate accounts to maintain data integrity.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="md:col-span-1 bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Add New Account</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="accountCode" className="block text-sm font-medium text-slate-700">
                Account Code *
              </label>
              <input
                type="text"
                id="accountCode"
                value={accountCode}
                onChange={(e) => setAccountCode(e.target.value.toUpperCase())}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., 1011"
                required
              />
            </div>
            
            <div>
              <label htmlFor="accountName" className="block text-sm font-medium text-slate-700">
                Account Name *
              </label>
              <input
                type="text"
                id="accountName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g., Petty Cash"
                required
              />
            </div>
            
            <div>
              <label htmlFor="accountType" className="block text-sm font-medium text-slate-700">
                Account Type *
              </label>
              <select
                id="accountType"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                required
              >
                <option value="Asset">Asset</option>
                <option value="Liability">Liability</option>
                <option value="Equity">Equity</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="parentCode" className="block text-sm font-medium text-slate-700">
                Parent Account Code
              </label>
              <input
                type="text"
                id="parentCode"
                value={parentCode}
                onChange={(e) => setParentCode(e.target.value.toUpperCase())}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Optional parent account"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Optional: A brief description of the account"
              />
            </div>
            
            <div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>

        {/* Table Section */}
        <div className="md:col-span-2">
          <div className="mb-4 flex justify-between items-center">
            <h4 className="text-lg font-semibold text-slate-800">Existing Accounts</h4>
            <button 
              onClick={loadAccounts}
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Account Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-slate-500">
                      Loading accounts...
                    </td>
                  </tr>
                ) : accounts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-slate-500">
                      No accounts found. Create your first account above.
                    </td>
                  </tr>
                ) : (
                  accounts.map((account) => {
                    const isDuplicate = duplicateCodes.has(account.code);
                    return (
                      <tr 
                        key={account._id} 
                        className={`hover:bg-slate-50 ${isDuplicate ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          <div className="flex items-center">
                            {account.code}
                            {isDuplicate && (
                              <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">DUPLICATE</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {account.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(account.type)}`}>
                            {account.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {account.parentCode || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            account.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {account.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default ChartOfAccounts;