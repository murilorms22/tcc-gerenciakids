import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function RotaProtegida() {
  const { isAutenticado } = useAuth();
  return isAutenticado ? <Outlet /> : <Navigate to="/login" />;
}
