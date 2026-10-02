import { Zap } from "lucide-react";

export default function FooterVoltz() {
  return (
    <footer className="bg-[#001B48] text-white py-6">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span className="font-semibold text-lg">Voltz Store</span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-300 text-center">
            © 2025 Voltz Store. Todos os direitos reservados.
          </p>

          {/* Links */}
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-yellow-400 transition">
              Política de Privacidade
            </a>
            <a href="#" className="hover:text-yellow-400 transition">
              Termos de Uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
