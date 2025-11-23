import { useState } from "react";
import { api } from "../../services/api";
import Swal from "sweetalert2";

export default function FormAddBateria() {
    const [formData, setFormData] = useState({
        image: "",
        model: "",
        name: "",
        price: "",
        vehicles: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const newBattery = {
                image: formData.image,
                model: formData.model,
                name: formData.name,
                price: Number(formData.price),
                vehicles: formData.vehicles.split(",").map(v => v.trim()),
                userReviews: []
            };

            await api.post("/products", newBattery);

            Swal.fire({
                html: `
    <div style="text-align: center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="#2563eb" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 20px;">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
      <h2 style="font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 10px;">Bateria adicionada!</h2>
      <p style="color: #6b7280;">A bateria foi cadastrada com sucesso</p>
    </div>
  `,
                showConfirmButton: true,
                confirmButtonColor: '#2563eb',
                confirmButtonText: 'OK'
            });

            setFormData({
                image: "",
                model: "",
                name: "",
                price: "",
                vehicles: "",
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erro!',
                text: 'Não foi possível adicionar a bateria.',
                confirmButtonColor: '#002D72'
            });
        }
    };

    return (
        <section className="min-h-screen bg-gray-100 py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-[#002D72] mb-6">Adicionar Nova Bateria</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Imagem (URL ou caminho)
                        </label>
                        <input
                            type="text"
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="./bateria-exemplo.webp"
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#002D72] focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Modelo
                        </label>
                        <input
                            type="text"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            placeholder="HNP60HD"
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#002D72] focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Nome
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Bateria Heliar 60ah"
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#002D72] focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Preço (R$)
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="595"
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#002D72] focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Veículos compatíveis (separados por vírgula)
                        </label>
                        <textarea
                            name="vehicles"
                            value={formData.vehicles}
                            onChange={handleChange}
                            placeholder="Q3, A3, Tiggo 2, Aircross"
                            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#002D72] focus:outline-none h-24"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#002D72] hover:bg-[#003B99] text-white font-bold py-3 rounded-lg transition-all"
                    >
                        Adicionar Bateria
                    </button>
                </form>
            </div>
        </section>
    );
}
