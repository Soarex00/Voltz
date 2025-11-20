import { useEffect, useState } from "react";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const saved = localStorage.getItem("favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  };

  const removeFavorite = (productId) => {
    const newFavorites = favorites.filter((fav) => fav.id !== productId);
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  const clearAll = () => {
    setFavorites([]);
    localStorage.removeItem("favorites");
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 fill-red-500 text-red-500" />
              <h1 className="text-3xl md:text-4xl font-bold text-[#002D72]">
                Meus Favoritos
              </h1>
            </div>
            {favorites.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Limpar todos
              </button>
            )}
          </div>

          {/* Contador de favoritos */}
          <p className="text-gray-600 mb-8">
            {favorites.length === 0
              ? "Você ainda não tem favoritos"
              : `Você tem ${favorites.length} ${
                  favorites.length === 1 ? "produto favorito" : "produtos favoritos"
                }`}
          </p>

          {favorites.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                Nenhum favorito ainda
              </h2>
              <p className="text-gray-500 mb-6">
                Adicione produtos aos favoritos para vê-los aqui
              </p>
              <a
                href="/"
                className="inline-block bg-[#002D72] text-white px-6 py-3 rounded-lg hover:bg-[#003B99] transition-colors"
              >
                Explorar Produtos
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {favorites.map((product) => (
                <div
                  key={product.id}
                  className="border border-[#002D72] rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white relative"
                >
                  <button
                    onClick={() => removeFavorite(product.id)}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200"
                    aria-label="Remover dos favoritos"
                  >
                    <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                  </button>

                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-contain p-4"
                  />

                  <div className="px-5 pb-6 text-center">
                    <p className="text-gray-500 text-sm mb-1">
                      Modelo <span className="font-medium">{product.model}</span>
                    </p>

                    <h3 className="text-lg font-bold text-[#002D72] mb-2">
                      {product.name}
                    </h3>

                    <p className="text-gray-500 text-sm mb-1">A partir de</p>
                    <p className="text-2xl font-bold text-[#002D72] mb-4">
                      R$
                      {product.price.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>

                    <button className="w-full flex items-center justify-center gap-2 bg-[#002D72] text-white font-semibold py-2.5 rounded-lg hover:bg-[#003B99] transition-all duration-200">
                      <ShoppingCart className="h-5 w-5" />
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
