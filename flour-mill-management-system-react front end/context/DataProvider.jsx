import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import apiFetch from '../utils/apiFetch';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    let cancelled = false;
      try {
        setLoading(true);
        setError('');
        
        // Check if user is authenticated before making API calls
        const token = typeof window !== 'undefined' ? (sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token')) : null;
        if (!token) {
          console.log('DataProvider: No auth token, skipping data load');
          setLoading(false);
          return;
        }
        
        const [supRes, prodRes, accRes] = await Promise.all([
          apiFetch(`${API}/suppliers`).then(async r => {
            try { return r.ok ? await r.json() : []; } catch { return []; }
          }).catch(() => []),
          apiFetch(`${API}/products`).then(async r => {
            try { return r.ok ? await r.json() : []; } catch { return []; }
          }).catch(() => []),
          apiFetch(`${API}/accounts`).then(async r => {
            try { return r.ok ? await r.json() : []; } catch { return []; }
          }).catch(() => [])
        ]);
        if (!cancelled) {
          setSuppliers(Array.isArray(supRes) ? supRes : []);
          setProducts(Array.isArray(prodRes) ? prodRes : []);
          setAccounts(Array.isArray(accRes) ? accRes : []);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load shared lists');
      } finally {
        if (!cancelled) setLoading(false);
      }
    return () => { cancelled = true; };
  };

  useEffect(() => {
    let cleanup = () => {};
    load().then(fn => { if (typeof fn === 'function') cleanup = fn; });
    return () => { cleanup(); };
  }, [API]);

  const refresh = async () => { await load(); };
  const value = useMemo(() => ({ suppliers, products, accounts, loading, error, refresh }), [suppliers, products, accounts, loading, error]);

  return (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  );
};

export const useSharedData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useSharedData must be used within DataProvider');
  return ctx;
};
