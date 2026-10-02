import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Dashboard from '../components/Dashboard';
import ProductForm from '../components/ProductForm';
import { api, errorMessage } from '../services/api';
export default function Admin({ initialTab = 'dashboard' }) {
  const [tab, setTab] = useState(initialTab), [dashboard, setDashboard] = useState(null), [products, setProducts] = useState([]), [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null), [showForm, setShowForm] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState(''), [loading, setLoading] = useState(true), [busyId, setBusyId] = useState(null);
  const [replies, setReplies] = useState({}), [pendingOnly, setPendingOnly] = useState(false);
  const load = useCallback(async () => {
    const [d,p,i] = await Promise.all([api.get('/admin/dashboard'),api.get('/products'),api.get('/admin/interactions')]);
    setDashboard(d.data); setProducts(p.data); setItems(i.data); setLoading(false);
  }, []);
  useEffect(() => { load().catch(err => { setError(errorMessage(err)); setLoading(false); }); }, [load]);
  async function action(id, task, success) {
    setBusyId(id); setError(''); setNotice('');
    try { await task(); await load(); setNotice(success); }
    catch (err) { setError(errorMessage(err)); } finally { setBusyId(null); }
  }
  return <><Header /><main className="min-h-screen bg-slate-50"><div className="max-w-7xl mx-auto px-6 py-10">
    <div className="flex flex-wrap justify-between items-center gap-4 mb-7"><div><p className="text-blue-700 text-sm font-semibold">ÁREA RESTRITA</p><h1 className="text-3xl font-bold text-blue-900 mt-1">Administração Voltz</h1></div><button className="btn-secondary" onClick={() => { setLoading(true); load().catch(e => { setError(errorMessage(e)); setLoading(false); }); }}>Atualizar dados</button></div>
    <nav className="flex flex-wrap gap-3 mb-8" aria-label="Administração">{[['dashboard','Visão geral'],['products','Produtos'],['interactions','Avaliações e respostas']].map(([key,label]) => <button className={tab === key ? 'btn' : 'btn-secondary'} key={key} aria-pressed={tab === key} onClick={() => setTab(key)}>{label}</button>)}</nav>
    {error && <p role="alert" className="p-4 mb-5 bg-red-50 text-red-700 rounded-lg">{error}</p>}{notice && <p role="status" className="p-4 mb-5 bg-blue-50 text-blue-700 rounded-lg">{notice}</p>}
    {loading ? <p role="status">Carregando dados…</p> : <>
      {tab === 'dashboard' && <Dashboard data={dashboard} />}
      {tab === 'products' && <div className="space-y-6"><div className="flex justify-between items-center"><h2 className="text-xl font-bold text-blue-900">{products.length} produtos cadastrados</h2><button className="btn" onClick={() => { setEditing(null); setShowForm(true); }}>Novo produto</button></div>
        {showForm && <ProductForm key={editing?.id || 'new'} product={editing} onCancel={() => setShowForm(false)} onSaved={async () => { await load(); setShowForm(false); setNotice('Produto salvo com sucesso.'); }} />}
        <div className="panel overflow-auto"><table className="w-full text-left min-w-160"><thead><tr className="border-b"><th className="py-3">Produto</th><th>Preço</th><th>Destaque</th><th>Ações</th></tr></thead><tbody>{products.map(p => <tr key={p.id} className="border-b"><td className="py-4"><Link to={`/produtos/${p.id}`} className="font-semibold text-blue-800">{p.name}</Link><p className="text-sm text-slate-500">{p.model}</p></td><td>{p.price.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</td><td>{p.destaque ? 'Sim' : 'Não'}</td><td><div className="flex gap-3"><button className="text-blue-700" onClick={() => { setEditing(p); setShowForm(true); window.scrollTo({top:0,behavior:'smooth'}); }}>Editar</button><button className="text-red-700" disabled={busyId === p.id} onClick={() => { if (window.confirm(`Excluir ${p.name}? As avaliações deste produto também serão excluídas.`)) action(p.id, () => api.delete(`/products/${p.id}`), 'Produto excluído.'); }}>Excluir</button></div></td></tr>)}</tbody></table>{!products.length && <p className="py-5">Nenhum produto cadastrado.</p>}</div>
      </div>}
      {tab === 'interactions' && <div className="space-y-5"><div className="flex flex-wrap justify-between gap-4"><h2 className="text-xl font-bold text-blue-900">Avaliações dos clientes</h2><label className="flex items-center gap-2"><input type="checkbox" checked={pendingOnly} onChange={e => setPendingOnly(e.target.checked)} />Somente sem resposta</label></div>
        {items.filter(i => !pendingOnly || !i.reply).map(i => <article className="panel" key={i.id}><div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold text-blue-900">{i.product_name} • {i.client_name}</h3><p className="text-sm text-slate-500">{new Date(i.created_at).toLocaleString('pt-BR')}</p></div><p className="text-amber-600 mt-2">{'★'.repeat(i.rating)}{'☆'.repeat(5-i.rating)}</p><p className="my-4 whitespace-pre-wrap break-words">{i.comment}</p>
          {i.reply && <div className="bg-blue-50 p-4 rounded-lg mb-4"><p className="text-sm font-semibold">Resposta publicada por {i.admin_name}</p><p className="whitespace-pre-wrap break-words mt-2">{i.reply}</p></div>}
          <form onSubmit={e => { e.preventDefault(); action(i.id, () => api.put(`/admin/interactions/${i.id}/reply`, { reply: replies[i.id] ?? i.reply ?? '' }), 'Resposta publicada e disponível para o cliente.'); }}><label className="block">{i.reply ? 'Editar resposta' : 'Responder ao cliente'}<textarea className="field" rows={3} required minLength={3} maxLength={2000} value={replies[i.id] ?? i.reply ?? ''} onChange={e => setReplies({ ...replies, [i.id]: e.target.value })} /></label><div className="flex flex-wrap gap-4 mt-4"><button className="btn" disabled={busyId === i.id}>{busyId === i.id ? 'Salvando…' : 'Publicar resposta'}</button><button type="button" className="text-red-700" disabled={busyId === i.id} onClick={() => { if (window.confirm('Excluir esta avaliação?')) action(i.id, () => api.delete(`/admin/interactions/${i.id}`), 'Avaliação excluída.'); }}>Excluir avaliação</button></div></form>
        </article>)}{!items.filter(i => !pendingOnly || !i.reply).length && <p className="panel">Nenhuma avaliação para exibir.</p>}
      </div>}
    </>}
  </div></main></>;
}
