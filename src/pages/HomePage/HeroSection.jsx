import { Zap } from "lucide-react";
import { useState, useEffect } from "react";

export default function HeroSection() {
  const images = [
    "bateria starke.webp",
    "Bateria Zetta.webp",
    "bateria moura.webp",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((previa) => (previa + 1) % images.length);
    }, 2000); // vai trocar a cada 2s

    // impede de ficar varios timers rodando ao mesmo tempo quando resetar a pagina
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section
      id="hero"
      className="bg-[#00174F] relative overflow-hidden py-12 md:py-20 lg:py-24"
    >
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Texto */}
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <Zap className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium">
                Entrega em até 49 minutos
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              A bateria do seu carro entregue e instalada em{" "}
              <span className="text-yellow-400">Pelotas</span>
            </h1>

            <p className="text-base md:text-lg text-white/90 max-w-md">
              Sua jornada de energia confiável começa com um clique. Encontre a
              bateria perfeita para seu veículo.
            </p>

            {/* Botões (caso adicione depois) */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2"></div>
          </div>

          {/* Imagem */}
          <div
            className="relative flex justify-center md:justify-end 
                w-[320px] md:w-[420px] lg:w-[480px] 
                h-[260px] md:h-[380px] lg:h-[460px] overflow-hidden"
          >
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Bateria Automotiva"
                className={`
        absolute top-0 left-0 
        w-full h-full object-contain z-10 drop-shadow-2xl
        transition-opacity duration-700 
        /* Se o i === ao indice atual, mostra senão, esconde.*/
        ${i === index ? "opacity-100" : "opacity-0"}
      `}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
