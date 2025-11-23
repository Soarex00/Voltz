import { ShoppingCart, Zap, Heart, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getFavorites } from "../utils/addToFavorites";

export function getCartItems() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

export default function Header() {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [menuAberto, setMenuAberto] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  {/* Verificar se é admin*/ }
  useEffect(() => {
    const checkAdmin = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.isAdmin === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  {/* Verificar se está logado */ }
  useEffect(() => {
    const checkLogin = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    checkLogin();

    {/* Atualizar quando localStorage mudar (mesmo em outra aba) */ }
    window.addEventListener('storage', checkLogin);

    return () => {
      window.removeEventListener('storage', checkLogin);
    };
  }, []);

  {/* Contador de itens carrinho */ }
  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = getCartItems();
      const totalQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
      setCartCount(totalQuantity);
    };

    updateCartCount();
    const interval = setInterval(updateCartCount, 1000);
    return () => clearInterval(interval);
  }, []);

  {/* Contador de favoritos */ }
  useEffect(() => {
    const updateFavoritesCount = () => {
      const favorites = getFavorites();
      setFavoritesCount(favorites.length);
    };

    updateFavoritesCount();
    const interval = setInterval(updateFavoritesCount, 1000);

    return () => clearInterval(interval);
  }, []);


  {/* Função de logout */ }
  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <div className="flex items-center gap-2 cursor-pointer">
              <Zap className="h-6 w-6 text-blue-600 fill-blue-600" />
              <span className="text-xl font-bold text-blue-600">Voltz Store</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#hero"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Início
            </a>
            <a
              href="#catalogo"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Catálogo
            </a>
            <a
              href="#howfunction"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Sobre
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Contato
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/favorites"
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Heart className="h-5 w-5 text-gray-700" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {favoritesCount}
                </span>
              )}
            </Link>

            <Link
              to="/carrinho"
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="hidden md:flex items-center gap-3">
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-2 px-5 rounded-lg transition-all"
                  >
                    Cadastrar
                  </Link>
                </>
              ) : (
                <>
                  <span className="text-gray-700 font-medium">
                    Olá, {user?.nome}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all"
                  >
                    Sair
                  </button>

                  {isAdmin && (
                    <>
                      <Link
                        to="/add-bateria"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all"
                      >
                        Adicionar Produto
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Botão Menu Mobile */}
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {menuAberto ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {menuAberto && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-3">
              <a
                href="#hero"
                onClick={() => setMenuAberto(false)}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2"
              >
                Início
              </a>
              <a
                href="#catalogo"
                onClick={() => setMenuAberto(false)}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2"
              >
                Catálogo
              </a>
              <a
                href="#howfunction"
                onClick={() => setMenuAberto(false)}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2"
              >
                Sobre
              </a>
              <a
                href="#contact"
                onClick={() => setMenuAberto(false)}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors py-2"
              >
                Contato
              </a>

              {/* Botões Mobile - Condicional */}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200">
                {!isLoggedIn ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuAberto(false)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-2.5 px-5 rounded-lg shadow-md transition-all"
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuAberto(false)}
                      className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-center font-semibold py-2.5 px-5 rounded-lg transition-all"
                    >
                      Cadastrar
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="text-center text-gray-700 font-medium py-2">
                      Olá, {user?.nome}
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuAberto(false);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-center font-semibold py-2.5 px-5 rounded-lg shadow-md transition-all"
                    >
                      Sair
                    </button>

                    {isAdmin && (
                      <>
                        <Link
                          to="/add-bateria"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition-all text-center"
                        >
                          Adicionar Produto
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>

  );
}
