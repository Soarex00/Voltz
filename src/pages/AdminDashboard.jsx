import { useCallback, useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../services/api";
const statuses = [
  { value: "PENDENTE", label: "Pendente" },
  { value: "CONFIRMADO", label: "Confirmado" },
  { value: "EM_PREPARO", label: "Em preparo" },
  { value: "ENVIADO", label: "Saiu para entrega" },
  { value: "CONCLUIDO", label: "Entregue" },
  { value: "CANCELADO", label: "Cancelado" },
];
const statusLabels = Object.fromEntries(
  statuses.map(({ value, label }) => [value, label]),
);
export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [updatingStatuses, setUpdatingStatuses] = useState({});
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      const [a, b, c] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/orders"),
        api.get("/products"),
      ]);
      setSummary(a.data);
      setOrders(b.data);
      setProducts(c.data);
    } catch (e) {
      setError(
        e.response?.data?.mensagem || "Acesso restrito ao administrador.",
      );
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  async function updateStatus(order, status) {
    setUpdatingStatuses((current) => ({ ...current, [order.id]: true }));
    try {
      await api.patch(`/admin/orders/${order.id}`, {
        status,
        respostaAdmin: order.respostaAdmin || "",
      });
      await load();
    } catch (e) {
      window.alert(
        e.response?.data?.mensagem || "Não foi possível atualizar o status.",
      );
    } finally {
      setUpdatingStatuses((current) => ({ ...current, [order.id]: false }));
    }
  }
  async function editProduct(product) {
    const name = window.prompt("Nome da bateria:", product.name);
    if (name === null) return;
    const price = Number(window.prompt("Preço (R$):", product.price));
    if (!name.trim() || !Number.isFinite(price) || price <= 0)
      return window.alert("Nome e preço válidos são obrigatórios.");
    await api.put(`/products/${product.id}`, {
      image: product.image,
      model: product.model,
      name: name.trim(),
      price,
      rating: product.rating,
      reviews: product.reviews,
      vehicles: product.vehicles,
      destaque: product.destaque,
      ativo: product.ativo,
    });
    await load();
  }
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto p-6 min-h-[70vh]">
        <h1 className="text-3xl font-bold text-[#002D72] mb-6">
          Painel administrativo
        </h1>
        {error && (
          <p role="alert" className="p-4 bg-amber-50 rounded">
            {error}
          </p>
        )}
        {summary && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                ["Clientes", summary.clientes],
                ["Produtos", summary.produtos],
                ["Pedidos", summary.pedidos],
                ...summary.porStatus.map((s) => [s.status, s.quantidade]),
              ].map(([label, n]) => (
                <div
                  key={label}
                  className="rounded-xl bg-white p-5 shadow-sm border"
                >
                  <p className="text-gray-500">{label}</p>
                  <strong className="text-2xl text-[#002D72]">{n}</strong>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Produtos</h2>
              <a
                href="/add-bateria"
                className="px-4 py-2 rounded bg-blue-700 text-white"
              >
                Cadastrar produto
              </a>
            </div>
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 bg-white border rounded-lg p-3 mb-2"
              >
                <img
                  src={p.image}
                  alt=""
                  className="w-14 h-14 object-contain"
                />
                <span className="flex-1">
                  {p.name} · R$ {p.price.toFixed(2)}
                </span>
                <button
                  onClick={() => editProduct(p)}
                  className="px-3 py-2 border rounded"
                >
                  Editar
                </button>
              </div>
            ))}
            <h2 className="text-2xl font-bold my-5">Pedidos dos clientes</h2>
            {orders.map((o) => (
              <article
                key={o.id}
                className="bg-white border rounded-xl p-5 mb-4"
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h3 className="font-bold">
                      {o.produto.name} — {o.cliente.nome}
                    </h3>
                    <p>
                      {o.cliente.email} · {o.veiculo} · {o.endereco}
                    </p>
                    <p>
                      Status: {statusLabels[o.status] || o.status} · Total: R${" "}
                      {(Number(o.valorUnitario) * o.quantidade).toFixed(2)}
                    </p>
                    {o.respostaAdmin && <p>Resposta: {o.respostaAdmin}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {updatingStatuses[o.id] ? (
                      <span className="text-sm text-gray-500">Salvando…</span>
                    ) : (
                      <>
                        <button
                          onClick={() => updateStatus(o, "CANCELADO")}
                          disabled={["CANCELADO", "CONCLUIDO"].includes(
                            o.status,
                          )}
                          className="px-4 py-2 rounded border border-red-300 text-red-700 disabled:opacity-50"
                        >
                          Cancelar pedido
                        </button>
                        <button
                          onClick={() => updateStatus(o, "CONCLUIDO")}
                          disabled={["CANCELADO", "CONCLUIDO"].includes(
                            o.status,
                          )}
                          className="px-4 py-2 rounded bg-green-700 text-white disabled:opacity-50"
                        >
                          Marcar entregue
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
