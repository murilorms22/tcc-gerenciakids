import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function RotaProtegida({ allowedRoles }) {
  const { isAutenticado, user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="flex items-center justify-center w-full min-h-screen bg-(--bg-page) text-(--azul-escuro)">
        <div className="bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-center">
          <p className="text-xl font-bold">Validando sessão segura...</p>
          <p className="text-sm text-(--text-gray) mt-1">
            Verificando credenciais e permissões LGPD
          </p>
        </div>
      </div>
    );
  }

  if (!isAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (
    Array.isArray(allowedRoles) &&
    allowedRoles.length > 0 &&
    (!user?.role || !allowedRoles.includes(user.role))
  ) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
