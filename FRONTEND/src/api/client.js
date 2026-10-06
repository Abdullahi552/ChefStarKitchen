export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
export const TOKEN_KEY = 'chefstar_token';
export const USER_KEY = 'chefstar_user';

const headers = (json = true) => {
  const t = localStorage.getItem(TOKEN_KEY);
  return { ...(json && { 'Content-Type': 'application/json' }), ...(t && { Authorization: `Bearer ${t}` }) };
};
async function handle(res) {
  if (res.status === 401) { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || `Request failed (${res.status})`);
  return data;
}
export const request = (path, { method = 'GET', body } = {}) =>
  fetch(`${API_URL}${path}`, { method, headers: headers(), body: body ? JSON.stringify(body) : undefined }).then(handle);
export const uploadFile = (path, file) => {
  const fd = new FormData(); fd.append('file', file);
  return fetch(`${API_URL}${path}`, { method: 'POST', headers: headers(false), body: fd }).then(handle);
};
