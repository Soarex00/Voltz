import { Zap, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { api } from "./services/api";
import Swal from "sweetalert2";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    senha: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      {/* Buscar usuário por email */}
      const response = await api.get(`/users?email=${formData.email}`);

      if (response.data.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Usuário não encontrado',
          text: 'Email não cadastrado',
          confirmButtonColor: '#2563eb'
        });
        return;
      }

      const user = response.data[0];

      {/* Verificar senha */}
      if (user.senha !== formData.senha) {
        Swal.fire({
          icon: 'error',
          title: 'Senha incorreta',
          text: 'Tente novamente',
          confirmButtonColor: '#2563eb'
        });
        return;
      }

      {/* Salvar usuário no localStorage */}
      localStorage.setItem('user', JSON.stringify(user));

      {/* Sucesso */}
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
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'OK'
      });

      {/* Redirecionar para home */}
      navigate("/");

    } catch (error) {
      console.error("Erro ao fazer login:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Tente novamente mais tarde',
        confirmButtonColor: '#2563eb'
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
