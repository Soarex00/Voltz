import { getSessionUser } from '../services/session';
export function storeKey(kind) { return `${kind}:${getSessionUser()?.id || 'guest'}`; }
export function readStore(kind) { try { return JSON.parse(localStorage.getItem(storeKey(kind))) || []; } catch { return []; } }
export function writeStore(kind, items) { localStorage.setItem(storeKey(kind), JSON.stringify(items)); window.dispatchEvent(new Event('store-change')); }
