import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const RoleProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, loading, isAuthenticated } = useUser();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Compatibilidad: user puede ser objeto o arreglo [usuario]
  const u = Array.isArray(user) ? user[0] : user;
  // rol principal o fallback a cargo si así viene del backend
  const roleValue = u?.rol ?? u?.cargo;
  const numericRole = roleValue != null ? Number(roleValue) : undefined;

  // Always redirect role 3 users to /inventario regardless of route permissions
  if (numericRole === 3) {
    return <Navigate to="/inventario" replace />;
  }

  const isAllowed = allowedRoles.length === 0 || (numericRole != null && allowedRoles.includes(numericRole));

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
