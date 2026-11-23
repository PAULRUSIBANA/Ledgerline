import { useCallback, useEffect, useRef, useState } from 'react';
import { createTransaction, deleteTransaction, getSummary, getTransactions } from '../api.js';

const DEFAULT_FILTERS = { type: 'all', category: 'all' };

// Owns transactions, summary, filters, loading and error state.
export function useTransactions() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ignores responses from requests that a newer request has overtaken.
  const latestRequest = useRef(0);

  const load = useCallback(async (activeFilters, { showLoading = true } = {}) => {
    const requestId = ++latestRequest.current;
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [list, sum] = await Promise.all([getTransactions(activeFilters), getSummary()]);
      if (requestId !== latestRequest.current) return;
      setTransactions(list);
      setSummary(sum);
    } catch (err) {
      if (requestId !== latestRequest.current) return;
      setError(err.message);
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => load(filters, { showLoading: false }), [filters, load]);

  // Fetch on mount and whenever a filter changes.
  useEffect(() => {
    load(filters);
  }, [filters, load]);

  const updateFilters = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const addTransaction = useCallback(
    async (body) => {
      const saved = await createTransaction(body);
      await refresh();
      return saved;
    },
    [refresh]
  );

  // Optimistic removal. Rolls back the list if the server call fails.
  const removeTransaction = useCallback(
    async (id) => {
      const previous = transactions;
      setTransactions(previous.filter((t) => t.id !== id));
      try {
        await deleteTransaction(id);
      } catch (err) {
        setTransactions(previous);
        throw err;
      }
      await refresh();
    },
    [transactions, refresh]
  );

  return {
    transactions,
    summary,
    filters,
    updateFilters,
    loading,
    error,
    refresh,
    addTransaction,
    removeTransaction,
  };
}
