export function getToken() { return sessionStorage.getItem('token') || localStorage.getItem('token'); }
export function getSessionUser() {
  if (!getToken()) return null;
  try { return JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || 'null'); } catch { return null; }
}
export function saveSession(data, remember) {
  clearSession(false);
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('token', data.token);
  storage.setItem('user', JSON.stringify(data.user));
  if (remember && data.user.role === 'client') localStorage.setItem('clientId', data.user.id);
  window.dispatchEvent(new Event('session-change'));
}
export function clearSession(notify = true) {
  for (const storage of [localStorage, sessionStorage]) for (const key of ['token', 'user', 'clientId']) storage.removeItem(key);
  if (notify) window.dispatchEvent(new Event('session-change'));
}
