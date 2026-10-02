import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../services/useSession';
export default function ProtectedRoute({ admin = false, children }) {
  const { user, loading } = useSession();
  const location = useLocation();
  if (loading) return <p className="p-12 text-center" role="status">Verificando sua sessão…</p>;
  if (!user) return <Navigate to={admin ? '/admin/login' : '/login'} state={{ from: location.pathname }} replace />;
  if (admin && !user.isAdmin) return <Navigate to="/" replace />;
  if (!admin && user.isAdmin) return <Navigate to="/admin" replace />;
  return children;
}
