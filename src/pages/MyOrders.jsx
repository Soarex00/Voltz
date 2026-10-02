import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../services/api";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/orders")
      .then(({ data }) => setOrders(data))
      .catch((e) =>
        setError(
          e.response?.data?.mensagem ||
            "Entre na sua conta para ver os pedidos.",
        ),
      );
  }, []);
  return (
    <>
      <Header />
      <main className="min-h-[70vh] max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-[#002D72] mb-6">Meus pedidos</h1>
        {error && (
          <p role="alert" className="p-4 bg-amber-50 rounded-lg">
            {error}
          </p>
        )}
        {orders.map((o) => (
          <article
            key={o.id}
            className="bg-white border rounded-xl p-5 mb-4 flex flex-col sm:flex-row gap-4"
          >
            <img
              className="w-24 h-24 object-contain"
              src={o.produto.image}
              alt=""
            />
            <div className="flex-1">
              <h2 className="font-bold">{o.produto.name}</h2>
              <p>
                Veículo: {o.veiculo} · Quantidade: {o.quantidade}
              </p>
              <p>
                Status: <strong>{o.status}</strong> · R${" "}
                {(Number(o.valorUnitario) * o.quantidade).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(o.createdAt).toLocaleString("pt-BR")}
              </p>
              {o.respostaAdmin && (
                <p className="mt-2 rounded bg-blue-50 p-3">
                  Resposta da loja: {o.respostaAdmin}
                </p>
              )}
            </div>
          </article>
        ))}
        {!error && orders.length === 0 && <p>Você ainda não fez pedidos.</p>}
      </main>
      <Footer />
    </>
  );
}
