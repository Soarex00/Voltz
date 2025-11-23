import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../../services/api";
import ProductCardFilter from "../../components/ProductCardFilter";

export default function BatteryFilter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  { /* Buscar produtos da API quando o componente carregar */ }
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };
    fetchProducts();
  }, []);

  {/* Filtrar produtos em tempo real por veículo (pelas iniciais) */ }
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts([]);
      return;
    }

    { /* Filtrar produtos em tempo real por veículo (pelas iniciais) */ }
    const searchLower = searchTerm.toLowerCase();
    const results = products.filter((product) =>
      product.vehicles.some((vehicle) =>
        vehicle.toLowerCase().startsWith(searchLower)
      )
    );

    { /* Atualizar produtos filtrados */ }
    setFilteredProducts(results);
  }, [searchTerm, products]);

  return (
    <>
      <section className="bg-white py-12 px-6 md:px-12  shadow-lg mx-4 md:mx-12 mt-10  border-gray-200">
        <div className="max-w-3xl mx-auto text-center text-gray-800 space-y-6">
          <h2 className="text-3xl font-bold text-blue-700">
            Encontre a bateria ideal para o seu veículo ⚡
          </h2>
          <p className="text-gray-500">
            Digite o modelo do seu carro e veja qual bateria é mais recomendada.
          </p>

          <div className="relative max-w-xl mx-auto mt-6">
            {/* Ícone azul dentro do campo */}
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-700 h-5 w-5" />

            {/* Campo de pesquisa branco com borda azul Mobile*/}
            <input
              type="text"
              placeholder="Modelo do veículo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-24 py-3 rounded-xl bg-gray-50 border border-blue-300 text-gray-900 text-base shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 placeholder:text-gray-500 md:hidden"
            />

            {/* Campo de pesquisa branco com borda azul Desktop*/}
            <input
              type="text"
              placeholder="Digite o modelo do seu veículo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-24 py-3 rounded-xl bg-gray-50 border border-blue-300 text-gray-900 text-base shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 placeholder:text-gray-500 hidden md:block"
            />

            {/* Botão à direita */}
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-all duration-200">
              Buscar
            </button>
          </div>
          </div>
          </section>
          

          {/* Resultados da busca */}
          {filteredProducts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-[#002D72] text-center mb-6">
                Baterias recomendadas para "{searchTerm}"
              </h3>
                <ProductCardFilter products={filteredProducts} />
            </div>
          )}

          {searchTerm && filteredProducts.length === 0 && (
            <div className="mt-8 text-center text-gray-500">
              <p>Nenhuma bateria encontrada para "{searchTerm}"</p>
              <p className="text-sm mt-2">Tente outro modelo de veículo</p>
            </div>
          )}
    </>
  );
}
