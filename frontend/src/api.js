// All network calls live here. Components and hooks never call fetch directly.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
  } catch {
    throw new Error('Cannot reach the Ledgerline server. Check that the backend is running.');
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    if (Array.isArray(data?.errors) && data.errors.length) {
      throw new Error(data.errors.join('. '));
    }
    throw new Error(data?.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export function getTransactions({ type, category } = {}) {
  const params = new URLSearchParams();
  if (type && type !== 'all') params.set('type', type);
  if (category && category !== 'all') params.set('category', category);
  const query = params.toString();
  return request(`/transactions${query ? `?${query}` : ''}`);
}

export function createTransaction(body) {
  return request('/transactions', { method: 'POST', body: JSON.stringify(body) });
}

export function deleteTransaction(id) {
  return request(`/transactions/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function getSummary() {
  return request('/summary');
}
