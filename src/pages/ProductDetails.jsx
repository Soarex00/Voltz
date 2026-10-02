import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import InteractionList from '../components/InteractionList';
import { api, errorMessage } from '../services/api';
import { useSession } from '../services/useSession';
import { addToCart } from '../utils/addToCart';
export default function ProductDetails() {
  const { id } = useParams(), { user } = useSession();
  const [product, setProduct] = useState(null), [items, setItems] = useState([]), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [rating, setRating] = useState(5), [comment, setComment] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([api.get(`/products/${id}`), api.get(`/products/${id}/interactions`)]).then(([p,i]) => { if (active) { setProduct(p.data); setItems(i.data); } }).catch(err => { if (active) setError(errorMessage(err)); });
    return () => { active = false; };
  }, [id]);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      await api.post(`/products/${id}/interactions`, { rating, comment });
      const [p,i] = await Promise.all([api.get(`/products/${id}`), api.get(`/products/${id}/interactions`)]);
      setProduct(p.data); setItems(i.data); setComment(''); setNotice('Avaliação enviada. Acompanhe a resposta em Minhas avaliações.');
    } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  return <><Header /><main className="max-w-6xl mx-auto px-6 py-12"><Link to="/#catalogo" className="text-blue-700">← Voltar ao catálogo</Link>
    {error && <p role="alert" className="my-5 text-red-700">{error}</p>}{notice && <p role="status" className="my-5 text-blue-700">{notice}</p>}
    {!product ? !error && <p className="mt-6">Carregando produto…</p> : <>
      <div className="grid md:grid-cols-2 gap-10 my-8"><img className="w-full h-72 object-contain" src={product.image} alt={product.name} /><div>
        {product.destaque && <p className="text-blue-700 font-semibold">Em destaque</p>}<h1 className="text-3xl font-bold text-blue-900 mt-2">{product.name}</h1><p className="text-slate-500 mt-2">Modelo {product.model} • Nota {product.rating.toFixed(1)} / 5 ({product.reviews} avaliações)</p><p className="text-3xl font-bold text-blue-900 my-5">{product.price.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</p><p className="whitespace-pre-wrap">{product.description}</p><h2 className="font-semibold mt-6">Veículos cadastrados</h2><p className="text-slate-600 mt-2">{product.vehicles.join(', ') || 'Consulte a loja.'}</p>
        <p className="text-xs text-slate-500 mt-3">Confirme ano, motorização e especificações no manual antes de comprar.</p>
        {user && !user.isAdmin ? <button className="btn mt-6" onClick={() => { addToCart(product); setNotice('Produto adicionado ao carrinho.'); }}>Adicionar ao carrinho</button> : !user && <Link className="btn mt-6" to="/login" state={{from:`/produtos/${id}`}}>Entrar para comprar ou avaliar</Link>}
      </div></div>
      <h2 className="text-2xl font-bold text-blue-900 mb-5">Avaliações dos clientes</h2><InteractionList items={items} />
      {user && !user.isAdmin && <form className="panel mt-8 space-y-4" onSubmit={submit}><h2 className="text-xl font-bold text-blue-900">Deixe sua avaliação</h2><label className="block">Nota<select className="field max-w-xs" value={rating} onChange={e => setRating(Number(e.target.value))}>{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} {n === 1 ? 'estrela' : 'estrelas'}</option>)}</select></label><label className="block">Comentário<textarea className="field" rows={4} required minLength={3} maxLength={2000} value={comment} onChange={e => setComment(e.target.value)} /></label><button className="btn" disabled={busy}>{busy ? 'Enviando…' : 'Enviar avaliação'}</button></form>}
    </>}
  </main><Footer /></>;
}
