// ═══════════════════════════════════════════════════════════════
//  PACKORA AI — API Client
//  Handles all communication with the backend server.
// ═══════════════════════════════════════════════════════════════

const API_BASE = 'http://localhost:3000/api';

/**
 * Run the packaging optimization via backend API.
 * @param {Object} payload - Input parameters
 * @returns {Promise<Object>} result object from server
 */
async function apiOptimize(payload) {
  const response = await fetch(`${API_BASE}/optimize`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err.errors ? err.errors.join(', ') : (err.error || `Server error ${response.status}`);
    throw new Error(msg);
  }

  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Optimization failed');
  return data.result;
}

/**
 * Fetch all datasets from the backend.
 * @returns {Promise<Object>} datasets object
 */
async function apiDatasets() {
  const response = await fetch(`${API_BASE}/datasets`);
  if (!response.ok) throw new Error('Failed to load datasets');
  const data = await response.json();
  return data.datasets;
}

/**
 * Check server health.
 * @returns {Promise<Object>}
 */
async function apiHealth() {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}

// ── History API calls

async function apiSaveHistory(result, name) {
  const response = await fetch(`${API_BASE}/history`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ result, name }),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Save failed');
  return data;
}

async function apiGetHistory() {
  const response = await fetch(`${API_BASE}/history`);
  if (!response.ok) throw new Error('Failed to load history');
  return response.json();
}

async function apiGetHistoryById(id) {
  const response = await fetch(`${API_BASE}/history/${id}`);
  if (!response.ok) throw new Error('Record not found');
  return response.json();
}

async function apiDeleteHistory(id) {
  const response = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Delete failed');
  return data;
}

async function apiClearHistory() {
  const response = await fetch(`${API_BASE}/history`, { method: 'DELETE' });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || 'Clear failed');
  return data;
}
