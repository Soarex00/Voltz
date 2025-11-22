import { Zap, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

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

        <form className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="password"
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
