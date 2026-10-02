import { ShoppingCart, Zap, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: ShoppingCart,
    title: "Escolha sua bateria",
    description:
      "Navegue por nosso catálogo e selecione a bateria ideal para seu veículo.",
  },
  {
    icon: Zap,
    title: "Entrega rápida",
    description:
      "Receba sua bateria em até 49 minutos em qualquer lugar de Pelotas.",
  },
  {
    icon: CheckCircle,
    title: "Instalação grátis",
    description: "Nossos técnicos instalam sua bateria sem custo adicional.",
  },
];

export default function HowFunction() {
  return (
    <section id="howfunction" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#002D72] mb-4">
            Como Funciona
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Veja como é simples e rápido comprar com a gente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center bg-[#002D72] text-white rounded-2xl shadow-lg p-8 transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              {/* Ícone */}
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-5">
                <step.icon className="h-8 w-8 text-[#002D72]" />
              </div>

              {/* Número */}
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-yellow-400 text-[#002D72] text-sm font-bold mb-3">
                {index + 1}
              </div>

              {/* Título e descrição */}
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-200 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
