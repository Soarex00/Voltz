import { Zap, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "./services/api";
import Swal from "sweetalert2";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    senha: "",
    manterConectado: false,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        ...formData,
        manterConectado: formData.manterConectado,
      });
      const { user, token } = response.data;
      const storage = formData.manterConectado ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(user));
      storage.setItem("authToken", token);
      (formData.manterConectado ? sessionStorage : localStorage).removeItem(
        "user",
      );
      (formData.manterConectado ? sessionStorage : localStorage).removeItem(
        "authToken",
      );
      if (formData.manterConectado && !user.isAdmin)
        localStorage.setItem("voltz_cliente_id", user.id);
      else localStorage.removeItem("voltz_cliente_id");

      {
        /* Sucesso */
      }
      await Swal.fire({
        html: `
    <div style="text-align: center;">
      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="#2563eb" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 20px;">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
      <h2 style="font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 10px;">Login realizado!</h2>
      <p style="color: #6b7280;">Bem-vindo, ${user.nome}!</p>
    </div>
  `,
        showConfirmButton: true,
        confirmButtonColor: "#2563eb",
        confirmButtonText: "OK",
      });

      {
        /* Redirecionar para home */
      }
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.mensagem || "Tente novamente mais tarde",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Voltar para página inicial"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        <div className="flex flex-col items-center mb-8">
          <Zap size={40} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-blue-700 mt-2">Entrar</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            placeholder="Senha"
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              name="manterConectado"
              checked={formData.manterConectado}
              onChange={(e) =>
                setFormData({ ...formData, manterConectado: e.target.checked })
              }
            />
            Manter conectado neste dispositivo
          </label>

          <button
            type="submit"
            className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Entrar
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-gray-600">
          Não tem conta?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Criar conta
          </a>
        </p>
      </div>
    </div>
  );
}
