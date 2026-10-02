import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import InteractionList from '../components/InteractionList';
import { api, errorMessage } from '../services/api';
export default function MyInteractions() {
  const [items, setItems] = useState([]), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; api.get('/interactions/mine').then(r => { if (active) setItems(r.data); }).catch(e => { if (active) setError(errorMessage(e)); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  return <><Header /><main className="max-w-4xl mx-auto px-6 py-12"><h1 className="text-3xl font-bold text-blue-900">Minhas avaliações</h1><p className="text-slate-500 mt-2 mb-8">Acompanhe suas opiniões e as respostas da loja.</p>{loading ? <p role="status">Carregando…</p> : error ? <p role="alert" className="text-red-700">{error}</p> : <InteractionList items={items} />}</main><Footer /></>;
}
