import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { getToken, getSessionUser, clearSession } from '../services/session';
import { SessionContext } from '../services/sessionContext';
export default function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function restore() {
      if (!getToken()) { clearSession(false); if (active) { setUser(null); setLoading(false); } return; }
      try {
        const { data } = await api.get('/auth/me');
        const storage = sessionStorage.getItem('token') ? sessionStorage : localStorage;
        storage.setItem('user', JSON.stringify(data));
        if (data.role === 'client' && storage === localStorage) localStorage.setItem('clientId', data.id);
        if (active) setUser(data);
      } catch (error) {
        if (error.response?.status === 401) clearSession(false);
        if (active) setUser(null);
      } finally { if (active) setLoading(false); }
    }
    restore();
    const update = () => { setUser(getSessionUser()); if (getToken()) restore(); };
    window.addEventListener('session-change', update);
    window.addEventListener('storage', update);
    return () => { active = false; window.removeEventListener('session-change', update); window.removeEventListener('storage', update); };
  }, []);
  return <SessionContext.Provider value={{ user, loading }}>{children}</SessionContext.Provider>;
}
