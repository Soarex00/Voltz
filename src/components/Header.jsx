import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ShoppingCart, Heart, Menu, X } from 'lucide-react';
import { useSession } from '../services/useSession';
import { api } from '../services/api';
import { clearSession } from '../services/session';
import { getCartItems } from '../utils/addToCart';
import { getFavorites } from '../utils/addToFavorites';
export default function Header() {
  const { user } = useSession();
  const [open, setOpen] = useState(false), [counts, setCounts] = useState({ cart: 0, favorites: 0 });
  const navigate = useNavigate();
  useEffect(() => {
    const update = () => setCounts({ cart: getCartItems().reduce((n,p) => n + p.quantity, 0), favorites: getFavorites().length });
    update(); window.addEventListener('store-change', update); window.addEventListener('storage', update);
    return () => { window.removeEventListener('store-change', update); window.removeEventListener('storage', update); };
  }, [user]);
  async function logout() { try { await api.post('/auth/logout'); } finally { clearSession(); setOpen(false); navigate('/'); } }
  const links = <>
    <Link to="/#catalogo" onClick={() => setOpen(false)}>Catálogo</Link>
    {user && !user.isAdmin && <Link to="/minhas-avaliacoes" onClick={() => setOpen(false)}>Minhas avaliações</Link>}
    {user?.isAdmin && <Link to="/admin" onClick={() => setOpen(false)}>Administração</Link>}
    {user ? <><span className="text-slate-500">Olá, {user.nome}</span><button onClick={logout} className="text-red-700">Sair</button></> : <><Link to="/login" className="text-blue-700">Entrar</Link><Link to="/register" className="btn">Cadastrar</Link></>}
  </>;
  return <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm"><div className="max-w-7xl mx-auto px-6">
    <div className="grid grid-cols-[1fr_auto] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 min-h-20 py-3"><Link to="/" className="justify-self-start flex items-center gap-3 font-bold text-xl text-blue-700 whitespace-nowrap"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white"><Zap size={23} /></span>Voltz Store</Link>
      <nav aria-label="Navegação principal" className="hidden lg:flex justify-self-center items-center gap-6 text-sm font-medium [&>a:not(.btn)]:py-3 [&>a:not(.btn)]:hover:text-blue-700 [&>span]:max-w-32 [&>span]:truncate">{links}</nav>
      <div className="justify-self-end flex items-center gap-2"><Link to="/favorites" aria-label={`Favoritos: ${counts.favorites}`} className="flex h-11 min-w-11 items-center justify-center gap-1 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-700"><Heart size={21} /><span className="text-sm">{counts.favorites || ''}</span></Link><Link to="/carrinho" aria-label={`Carrinho: ${counts.cart}`} className="flex h-11 min-w-11 items-center justify-center gap-1 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-700"><ShoppingCart size={21} /><span className="text-sm">{counts.cart || ''}</span></Link><button className="lg:hidden h-11 w-11 flex items-center justify-center rounded-xl hover:bg-blue-50" aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div>
    </div>{open && <nav className="lg:hidden flex flex-col gap-4 py-5 border-t">{links}</nav>}
  </div></header>;
}
