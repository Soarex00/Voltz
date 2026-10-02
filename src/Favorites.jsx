import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { getFavorites, addToFavorites } from "./utils/addToFavorites";
import { addToCart } from "./utils/addToCart";
import { Link } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Swal from "sweetalert2";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const favoritesData = getFavorites();
    setFavorites(favoritesData);
  };

  const removeFavorite = (product) => {
    addToFavorites(product); // Remove dos favoritos
    loadFavorites(); // Recarrega a lista
  };

  // eslint-disable-next-line no-unused-vars
  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#002D72] hover:text-[#003B99] font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar para a página inicial
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#002D72] mb-2">
              Meus Favoritos
            </h1>
            <p className="text-gray-600">
              {favorites.length}{" "}
              {favorites.length === 1 ? "produto" : "produtos"} salvos
            </p>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-20">
              <Heart className="h-20 w-20 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Nenhum favorito ainda
              </h2>
              <p className="text-gray-500 mb-6">
                Adicione produtos aos favoritos clicando no coração
              </p>
              <a
                href="/#product"
                className="inline-block bg-[#002D72] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#003B99] transition-all"
              >
                Ver Produtos
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favorites.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-contain p-4"
                    />

                    <button
                      onClick={() => removeFavorite(product)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all group"
                    >
                      <Trash2 className="h-4 w-4 text-red-500 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  <div className="px-5 pb-6 text-center flex flex-col flex-1">
                    <p className="text-gray-500 text-sm mb-1">
                      Modelo{" "}
                      <span className="font-medium">{product.model}</span>
                    </p>

                    <h3 className="text-lg font-bold text-[#002D72] mb-2">
                      {product.name}
                    </h3>

                    <p className="text-gray-500 text-sm">A partir de</p>
                    <p className="text-2xl font-bold text-[#002D72] mb-4">
                      R$
                      {product.price.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>

                    <button
                      onClick={() => {
                        addToCart(product);
                        Swal.fire({
                          toast: true,
                          position: "bottom-end",
                          icon: "success",
                          title: "Produto adicionado ao carrinho",
                          showConfirmButton: false,
                          timer: 2800,
                          timerProgressBar: true,
                        });
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-[#002D72] text-white font-semibold py-2.5 rounded-lg hover:bg-[#003B99] transition-all mt-auto"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Adicionar ao Carrinho
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
