import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { ShoppingCart as CartIcon } from "lucide-react";
export default function ShoppingCart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(cartItems);
  }, []);

  function removeItem(id) {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  }

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Título */}
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-8 h-8 text-[#002D72]" />
          <h1 className="text-3xl font-bold text-[#002D72]">Seu Carrinho</h1>
        </div>

        {/* Carrinho vazio */}
        {cart.length === 0 && (
          <div className="bg-white p-8 rounded-2xl shadow text-center">
            <p className="text-gray-600 text-lg mb-6">
              Seu carrinho está vazio.
            </p>

            <Link
              to="/"
              className="inline-block bg-[#002D72] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#003B99] transition"
            >
              <ArrowLeft className="inline-block w-4 h-4 mr-2" />
              Voltar às compras
            </Link>
          </div>
        )}

        {/* Lista de itens */}
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl shadow flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-contain"
                />

                <div>
                  <h2 className="text-lg font-semibold text-[#002D72]">
                    {item.name}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Quantidade: {item.quantity}
                  </p>
                  <p className="text-[#003B99] font-bold text-lg">
                    R$
                    {item.price.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700 transition"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
          ))}
        </div>

        {/* Resumo */}
        {cart.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-bold text-[#002D72] mb-4">Resumo</h2>

            <div className="flex justify-between text-lg font-semibold mb-6">
              <span>Total:</span>
              <span className="text-[#003B99]">
                R$
                {total.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <Link
              to="/checkout"
              className="block w-full text-center bg-[#002D72] text-white py-3 rounded-xl font-semibold hover:bg-[#003B99] transition"
            >
              Finalizar Compra
            </Link>

            <Link
              to="/"
              className="block w-full text-center mt-3 text-[#002D72] font-semibold hover:underline"
            >
              <ArrowLeft className="inline-block w-4 h-4 mr-1" />
              Continuar comprando
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
