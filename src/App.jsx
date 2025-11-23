import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "../src/Login";
import AddBateria from "./pages/AddBateria";
import RegisterPage from "../src/Register";
import ShoppingCart from "./ShoppingCart";
import Favorites from "./Favorites";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/add-bateria" element={<AddBateria />} />

        <Route path="/carrinho" element={<ShoppingCart />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </BrowserRouter>
  );
}
