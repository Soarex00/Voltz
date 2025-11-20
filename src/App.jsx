import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "../src/Login";
import RegisterPage from "../src/Register";
import ShoppingCart from "./ShoppingCart";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* rotas de autenticação */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/carrinho" element={<ShoppingCart />} />
      </Routes>
    </BrowserRouter>
  );
}
