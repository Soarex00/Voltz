import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, errorMessage } from './services/api';
import { saveSession } from './services/session';
export default function Login({ admin = false }) {
  const [form, setForm] = useState({ email: '', senha: '', remember: true });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate(), location = useLocation();
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const { data } = await api.post('/auth/login', { ...form, role: admin ? 'admin' : 'client' });
      saveSession(data, form.remember);
      navigate(location.state?.from || (admin ? '/admin' : '/'), { replace: true });
    } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6"><div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
    <Link to="/" className="text-blue-700">← Voltar para a loja</Link>
    <h1 className="text-3xl font-bold text-blue-900 mt-6 mb-2">{admin ? 'Área administrativa' : 'Entre na sua conta'}</h1>
    <p className="text-slate-500 mb-6">{admin ? 'Acesso exclusivo para administradores.' : 'Avalie produtos e acompanhe as respostas da loja.'}</p>
    <form onSubmit={submit} className="space-y-4">
      <label className="block">E-mail<input className="field" type="email" autoComplete="username" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
      <label className="block">Senha<input className="field" type="password" autoComplete="current-password" required maxLength={128} value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} /></label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={form.remember} onChange={e => setForm({ ...form, remember: e.target.checked })} />Manter conectado</label>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      <button className="btn w-full" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
    </form>
    {!admin && <p className="mt-6">Não tem conta? <Link className="text-blue-700 underline" to="/register">Cadastre-se</Link></p>}
    <Link className="text-sm text-slate-500 block mt-4" to={admin ? '/login' : '/admin/login'}>{admin ? 'Acesso do cliente' : 'Acesso administrativo'}</Link>
  </div></main>;
}
