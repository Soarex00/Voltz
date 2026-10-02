import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, errorMessage } from './services/api';
export default function Register() {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '', confirmarSenha: '' });
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault(); setError('');
    if (form.senha !== form.confirmarSenha) { setError('As senhas não coincidem.'); return; }
    setBusy(true);
    try { await api.post('/auth/register', form); navigate('/login', { replace: true }); }
    catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  return <main className="min-h-screen bg-slate-50 flex justify-center items-center p-6"><div className="bg-white rounded-2xl shadow p-8 w-full max-w-md">
    <Link className="text-blue-700" to="/">← Voltar para a loja</Link><h1 className="text-3xl font-bold text-blue-900 my-6">Criar conta</h1>
    <form onSubmit={submit} className="space-y-4">
      {[['nome','Nome','text'],['email','E-mail','email'],['telefone','Telefone (opcional)','tel'],['senha','Senha (mínimo 8 caracteres)','password'],['confirmarSenha','Confirme a senha','password']].map(([key,label,type]) => <label className="block" key={key}>{label}<input className="field" name={key} type={type} required={key !== 'telefone'} minLength={type === 'password' ? 8 : key === 'nome' ? 2 : undefined} maxLength={type === 'password' ? 128 : 100} autoComplete={type === 'password' ? 'new-password' : key === 'nome' ? 'name' : key === 'email' ? 'email' : 'tel'} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>)}
      {error && <p role="alert" className="text-red-700">{error}</p>}<button className="btn w-full" disabled={busy}>{busy ? 'Cadastrando…' : 'Cadastrar'}</button>
    </form><p className="mt-5">Já tem conta? <Link className="text-blue-700 underline" to="/login">Entrar</Link></p>
  </div></main>;
}
