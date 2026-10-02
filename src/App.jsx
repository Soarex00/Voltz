import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Checkout from "./pages/Checkout";
import LoginPage from "../src/Login";
import AddBateria from "./pages/AddBateria";
import RegisterPage from "../src/Register";
import ShoppingCart from "./ShoppingCart";
import Favorites from "./Favorites";
import MyOrders from "./pages/MyOrders";
import AdminDashboard from "./pages/AdminDashboard";

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
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/pedidos" element={<MyOrders />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
