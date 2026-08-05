const API_BASE = '/api';

function getToken() {
  return sessionStorage.getItem('lp_token');
}

function requireAuth() {
  if (!getToken()) window.location.href = 'index.html';
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    sessionStorage.removeItem('lp_token');
    window.location.href = 'index.html';
    return;
  }
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

function logout() {
  sessionStorage.removeItem('lp_token');
  window.location.href = 'index.html';
}

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function statusBadge(status) {
  const map = { active: 'badge-active', suspended: 'badge-suspended', cancelled: 'badge-cancelled', expired: 'badge-expired' };
  return `<span class="badge ${map[status] || 'badge-expired'}">${status}</span>`;
}
