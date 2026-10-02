import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { api } from "../../services/api";
import ProductCardFilter from "../../components/ProductCardFilter";

export default function BatteryFilter() {
  const [vehicle, setVehicle] = useState("");
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function recommend(event) {
    event.preventDefault();
    if (vehicle.trim().length < 2) return;
    setLoading(true);
    setMessage("");
    setProducts([]);
    try {
      const { data } = await api.get("/recommendations/products", {
        params: { vehicle },
      });
      setProducts(data.produtos);
      setMessage(`${data.mensagem} ${data.aviso}`);
    } catch (error) {
      setMessage(
        error.response?.data?.mensagem ||
          "Não foi possível buscar uma recomendação agora.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <section className="bg-white py-12 px-6 md:px-12 shadow-lg mx-4 md:mx-12 mt-10 border border-gray-200 rounded-2xl">
        <div className="max-w-3xl mx-auto text-center text-gray-800 space-y-5">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Sparkles className="text-blue-700" />
          </div>
          <h2 className="text-3xl font-bold text-blue-700">
            Encontre a bateria ideal para o seu veículo
          </h2>
          <p className="text-gray-500">
            Informe marca, modelo e ano. A IA compara com as baterias
            disponíveis na loja.
          </p>
          <form
            onSubmit={recommend}
            className="relative max-w-xl mx-auto flex gap-2"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-700 h-5 w-5" />
            <input
              aria-label="Veículo"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              placeholder="Ex.: Chevrolet Onix 2020"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-blue-300 text-gray-900 focus:ring-2 focus:ring-blue-400 outline-none"
            />
            <button
              disabled={loading}
              className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold px-5 rounded-xl"
            >
              {loading ? "Buscando…" : "Buscar"}
            </button>
          </form>
          <p className="text-xs text-gray-500">
            A recomendação é orientativa. Confirme a especificação no manual do
            veículo.
          </p>
        </div>
      </section>
      {message && (
        <p
          role="status"
          className="max-w-3xl mx-auto mt-6 px-4 text-center text-gray-700"
        >
          {message}
        </p>
      )}
      {products.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-[#002D72] text-center mb-6">
            Sugestões para {vehicle}
          </h3>
          <ProductCardFilter products={products} />
        </div>
      )}
    </>
  );
}
