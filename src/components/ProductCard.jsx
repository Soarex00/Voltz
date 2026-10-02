import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { api, errorMessage } from '../services/api';
import AIAdvice from './AIAdvice';
import { useSession } from '../services/useSession';
import { addToCart } from '../utils/addToCart';
import { addToFavorites, isFavorite } from '../utils/addToFavorites';
export default function ProductCard() {
  const [products, setProducts] = useState([]), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(''), [mode, setMode] = useState('featured'), [notice, setNotice] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [favoriteVersion, setFavoriteVersion] = useState(0);
  const { user } = useSession();
  const navigate = useNavigate();
  useEffect(() => {
    let active = true;
    api.get('/products').then(({ data }) => { if (active) setProducts(data); }).catch(err => { if (active) setError(errorMessage(err)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  function interact(product, favorite) {
    if (!user) { navigate('/login', { state: { from: '/' } }); return; }
    if (user.isAdmin) { setNotice('Use uma conta de cliente para salvar favoritos ou comprar.'); return; }
    if (favorite) { const added = addToFavorites(product); setFavoriteVersion(favoriteVersion + 1); setNotice(added ? 'Produto salvo nos favoritos.' : 'Produto removido dos favoritos.'); }
    else { addToCart(product); setNotice('Produto adicionado ao carrinho.'); }
  }
  let shown = products.filter(p => mode !== 'featured' || p.destaque);
  if (query.trim()) { const q = query.trim().toLocaleLowerCase('pt-BR'); shown = shown.filter(p => [p.name,p.model,...p.vehicles].some(v => v.toLocaleLowerCase('pt-BR').includes(q) || q.includes(v.toLocaleLowerCase('pt-BR')))); }
  if (mode === 'rated') shown = [...shown].sort((a,b) => b.rating - a.rating);
  return <section id="catalogo" className="bg-slate-50 py-16 scroll-mt-20"><div className="max-w-7xl mx-auto px-6">
    <h2 className="text-3xl font-bold text-blue-900">Encontre sua bateria</h2><p className="text-slate-600 mt-2 mb-6">Pesquise por marca, modelo da bateria ou veículo cadastrado.</p>
    <form className="flex flex-col sm:flex-row gap-3 mb-5" onSubmit={e => { e.preventDefault(); setMode('all'); setVehicleSearch(query.trim()); }}><label className="flex-1"><span className="sr-only">Pesquisar produtos</span><input className="field mt-0" placeholder="Ex.: Chevrolet Onix 2020 1.0" value={query} onChange={e => { setQuery(e.target.value); setMode('all'); setVehicleSearch(''); }} /></label><button className="btn">Buscar e sugerir baterias</button></form>
    <AIAdvice vehicle={vehicleSearch} />
    <div className="flex flex-wrap gap-2 mb-7">{[['featured','Reexibir destaques'],['all','Todos os produtos'],['rated','Melhor avaliados']].map(([key,label]) => <button key={key} className={mode === key ? 'btn' : 'btn-secondary'} aria-pressed={mode === key} onClick={() => { setMode(key); if (key === 'featured') setQuery(''); }}>{label}</button>)}</div>
    {notice && <p className="text-blue-800 mb-5" role="status">{notice}</p>}
    {loading ? <p role="status">Carregando produtos…</p> : error ? <p role="alert" className="text-red-700">{error}</p> : shown.length === 0 ? <p>Nenhum produto encontrado. Tente outra pesquisa ou reexiba os destaques.</p> : <>
      <p className="text-sm text-slate-500 mb-4">{shown.length} produtos encontrados</p><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">{shown.map(product => <article key={product.id} className="panel flex flex-col relative">
        {product.destaque && <span className="text-xs font-bold text-blue-700 mb-2">EM DESTAQUE</span>}
        <Link to={`/produtos/${product.id}`}><img src={product.image} alt={product.name} className="w-full h-40 object-contain mb-4" /><h3 className="font-bold text-blue-900 text-lg">{product.name}</h3></Link>
        <p className="text-sm text-slate-500 mt-1">Modelo {product.model}</p><p className="flex gap-1 items-center mt-3"><Star className="text-amber-500" size={17} />{product.rating.toFixed(1)} <span className="text-sm text-slate-500">({product.reviews} avaliações)</span></p>
        <p className="text-2xl font-bold text-blue-900 my-4">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        <div className="mt-auto space-y-2"><Link className="btn-secondary w-full" to={`/produtos/${product.id}`}>Detalhes e avaliações</Link><div className="flex gap-2"><button className="btn flex-1" onClick={() => interact(product, false)}><ShoppingCart size={18} />Adicionar</button><button className="btn-secondary px-3" aria-label={`Favoritar ${product.name}`} aria-pressed={isFavorite(product.id)} onClick={() => interact(product, true)}><Heart size={20} className={isFavorite(product.id) ? 'fill-red-500 text-red-500' : ''} /></button></div></div>
      </article>)}</div></>}
  </div></section>;
}
