import { Phone, Mail, MapPin, Clock } from "lucide-react";

const contacts = [
  {
    icon: Phone,
    title: "Telefone",
    description: (
      <>
        (53) 3234-5678 <br /> (53) 99999-8888
      </>
    ),
  },
  {
    icon: Mail,
    title: "E-mail",
    description: (
      <>
        contato@voltzstore.com <br /> vendas@voltzstore.com
      </>
    ),
  },
  {
    icon: MapPin,
    title: "Endereço",
    description: (
      <>
        Rua das Baterias, 123 <br /> Centro — Pelotas/RS
      </>
    ),
  },
  {
    icon: Clock,
    title: "Horário",
    description: (
      <>
        Segunda a Sexta <br /> 8h às 18h
      </>
    ),
  },
];

export default function Contact() {
  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Título */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#002D72] mb-4">
            Entre em Contato
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Estamos aqui para ajudar. Fale conosco através dos canais abaixo.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {contacts.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center bg-[#002D72] text-white rounded-2xl shadow-lg p-8 transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              {/* Ícone */}
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-5">
                <item.icon className="h-8 w-8 text-[#002D72]" />
              </div>

              {/* Título */}
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>

              {/* Descrição */}
              <p className="text-gray-200 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
