import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  ShoppingCart,
  CheckCircle,
  MessageCircle,
  Clock,
  Package,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCartItems } from '../utils/addToCart';
import { useState } from 'react';

function Checkout() {
  const navigate = useNavigate();
  const cartItems = getCartItems();
  const [contactError, setContactError] = useState('');

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleWhatsAppContact = () => {
    const message = `Olá! Gostaria de finalizar minha compra:\n\n${cartItems
      .map(
        (item) =>
          `${item.quantity}x ${item.name} - R$ ${(
            item.price * item.quantity
          ).toFixed(2)}`
      )
      .join("\n")}\n\nTotal: R$ ${calculateTotal().toFixed(2)}`;

    const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '';
    if (!/^\d{10,15}$/.test(phoneNumber)) { setContactError('O contato por WhatsApp ainda não está disponível.'); return; }
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const steps = [
    {
      icon: ShoppingCart,
      title: "Carrinho",
      description: "Seus produtos selecionados",
    },
    {
      icon: MessageCircle,
      title: "Contato",
      description: "Fale conosco via WhatsApp",
    },
    {
      icon: CreditCard,
      title: "Pagamento",
      description: "Confirme a forma de pagamento",
    },
    {
      icon: Package,
      title: "Entrega",
      description: "Instalação em até 49 minutos",
    },
  ];

  return (
    <>
      <Header />
      {contactError && <p role="alert" className="p-4 text-center text-red-700 bg-red-50">{contactError}</p>}

      <div className="min-h-screen bg-gray-50">
        <section className="bg-[#002D72] py-12">
          <div className="container mx-auto px-6">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Finalize sua Compra
              </h1>
              <p className="text-lg text-white/90">
                Consulte a disponibilidade e combine sua compra com a loja.
              </p>
            </div>
          </div>
        </section>

        {/* Processo de Compra */}
        <section className="py-12">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                      <step.icon className="h-8 w-8 text-[#002D72]" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[#002D72] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              ))}
            </div>

            {/* Resumo do Pedido */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-[#002D72] text-white p-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <ShoppingCart className="h-6 w-6" />
                    Resumo do Pedido
                  </h2>
                </div>

                <div className="p-6">
                  {cartItems.length > 0 ? (
                    <>
                      <div className="space-y-4 mb-6">
                        {cartItems.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-contain rounded-lg bg-white p-1"
                              />
                              <div>
                                <h4 className="font-semibold text-[#002D72]">
                                  {item.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Quantidade: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-[#002D72]">
                                R$ {(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4 mb-6">
                        <div className="flex justify-between items-center text-xl font-bold">
                          <span className="text-gray-700">Total:</span>
                          <span className="text-[#002D72]">
                            R$ {calculateTotal().toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Informações de Entrega */}
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <Clock className="h-6 w-6 text-yellow-600 shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">
                              Entrega Rápida em Pelotas
                            </h4>
                            <p className="text-sm text-gray-600">
                              Instalação da bateria em até 49 minutos após a
                              confirmação do pagamento
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Botão WhatsApp */}
                      <button
                        onClick={handleWhatsAppContact}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-colors duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                      >
                        <MessageCircle className="h-6 w-6" />
                        <span className="text-lg">Finalizar pelo WhatsApp</span>
                      </button>

                      <p className="text-center text-sm text-gray-600 mt-4">
                        Ao clicar, você será redirecionado para o WhatsApp onde
                        nossa equipe irá auxiliá-lo com o processo de compra
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Seu carrinho está vazio
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Adicione produtos ao carrinho para finalizar sua compra
                      </p>
                      <button
                        onClick={() => navigate("/")}
                        className="bg-[#002D72] hover:bg-[#001a45] text-white font-bold py-3 px-8 rounded-xl transition-colors duration-300"
                      >
                        Ver Produtos
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6 text-center">
                  <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Compra Segura
                  </h4>
                  <p className="text-sm text-gray-600">
                    Atendimento personalizado via WhatsApp
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 text-center">
                  <Package className="h-10 w-10 text-blue-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Instalação Incluída
                  </h4>
                  <p className="text-sm text-gray-600">
                    Bateria entregue e instalada no local
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 text-center">
                  <Clock className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Entrega Rápida
                  </h4>
                  <p className="text-sm text-gray-600">
                    Em até 49 minutos em Pelotas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

export default Checkout;

