import { ShoppingCart, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function ProductCard() {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Carregar favoritos do localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (error) {
        console.log("Erro ao carregar produtos:", error);
      }
    }

    loadProducts();
  }, []);

  // Verificar se um produto está nos favoritos
  const isFavorite = (productId) => {
    return favorites.some((fav) => fav.id === productId);
  };

  // Adicionar ou remover dos favoritos
  const toggleFavorite = (product) => {
    let updatedFavorites;

    if (isFavorite(product.id)) {
      // Remover dos favoritos
      updatedFavorites = favorites.filter((fav) => fav.id !== product.id);
    } else {
      // Adicionar aos favoritos
      updatedFavorites = [...favorites, product];
    }

    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  return (
    <section id="product" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#002D72] mb-4">
            Nossas Baterias
          </h2>
          <p className="text-lg text-gray-600">
            Escolha a melhor bateria para o seu veículo
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-[#002D72] rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white relative"
            >
              {/* Botão de Favoritos */}
              <button
                onClick={() => toggleFavorite(product)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200"
                aria-label={isFavorite(product.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    isFavorite(product.id)
                      ? "fill-red-500 text-red-500"
                      : "text-gray-400 hover:text-red-500"
                  }`}
                />
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
      </div>
    </section>
  );
}
