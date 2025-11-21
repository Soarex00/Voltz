import { ShoppingCart, Zap, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getFavorites } from "../utils/addToFavorites";

export default function Header() {
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    // Atualizar contador de favoritos
    const updateFavoritesCount = () => {
      const favorites = getFavorites();
      setFavoritesCount(favorites.length);
    };

    updateFavoritesCount();

    // Atualizar a cada segundo (simples, mas funcional)
    const interval = setInterval(updateFavoritesCount, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer">
            <Zap className="h-6 w-6 text-blue-600 fill-blue-600" />
            <span className="text-xl font-bold text-blue-600">Voltz Store</span>
          </div>

          {/* Navegação */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#hero"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Início
            </a>
            <a
              href="#product"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Produto
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

          <div className="hidden md:flex items-center gap-4">
            <div className="flex gap-3">
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                Entrar
              </Link>

              <Link
                to="/register"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                Cadastrar
              </Link>
            </div>
            
            <div className="flex items-center gap-2">
              <Link to="/favoritos" className="relative p-2 hover:bg-gray-100 rounded-full transition group">
                <Heart className="h-6 w-6 text-gray-700 group-hover:text-red-500 transition-colors" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </Link>

              <Link to="/carrinho" className="p-2 hover:bg-gray-100 rounded-full transition group">
                <ShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
