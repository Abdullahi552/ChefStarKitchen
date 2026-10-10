import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// admin routes send unauthenticated visitors to the hidden /admin/login URL
export function RequireAuth({ admin = false }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to={admin ? '/admin/login' : '/login'} state={{ from: loc.pathname }} replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
