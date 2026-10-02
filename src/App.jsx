import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Checkout from './pages/Checkout';
import Login from './Login';
import Register from './Register';
import ShoppingCart from './ShoppingCart';
import Favorites from './Favorites';
import ProductDetails from './pages/ProductDetails';
import MyInteractions from './pages/MyInteractions';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import SessionProvider from './components/SessionProvider';
export default function App() {
  return <BrowserRouter><SessionProvider><Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/admin/login" element={<Login admin />} />
    <Route path="/register" element={<Register />} />
    <Route path="/produtos/:id" element={<ProductDetails />} />
    <Route path="/carrinho" element={<ProtectedRoute><ShoppingCart /></ProtectedRoute>} />
    <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
    <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
    <Route path="/minhas-avaliacoes" element={<ProtectedRoute><MyInteractions /></ProtectedRoute>} />
    <Route path="/admin/*" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />
    <Route path="/add-bateria" element={<ProtectedRoute admin><Admin initialTab="products" /></ProtectedRoute>} />
    <Route path="*" element={<main className="p-12 text-center"><h1>Página não encontrada</h1><a href="/">Voltar para a loja</a></main>} />
  </Routes></SessionProvider></BrowserRouter>;
}
