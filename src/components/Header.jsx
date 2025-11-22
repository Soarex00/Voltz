import { ShoppingCart, Zap, Heart, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getFavorites } from "../utils/addToFavorites";

export default function Header() {
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const updateFavoritesCount = () => {
      const favorites = getFavorites();
      setFavoritesCount(favorites.length);
    };

    updateFavoritesCount();
    const interval = setInterval(updateFavoritesCount, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer">
            <Zap className="h-6 w-6 text-blue-600 fill-blue-600" />
            <span className="text-xl font-bold text-blue-600">Voltz Store</span>
          </div>

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
              to="/cart"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-gray-700" />
            </Link>

            <div className="hidden md:flex items-center gap-3">
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
            </div>

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

              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-200">
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
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
