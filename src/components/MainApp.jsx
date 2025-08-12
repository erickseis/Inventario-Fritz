import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import Productos from '../pages/Productos';
import MateriaPrima from '../pages/MateriaPrima';
import Produccion from '../pages/Produccion';
import Ventas from '../pages/Ventas';
import Inventario from '../pages/Inventario';
import Movimientos from '../pages/Movimientos';
import Proveedores from '../pages/Proveedores';
import Ubicaciones from '../pages/Ubicaciones';
import Reportes from '../pages/Reportes';
import Configuracion from '../pages/Configuracion';
import Header from './Header';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import EmpleadoSolicitudes from '../pages/EmpleadoSolicitudes';
import { useUser } from '../hooks/useUser';

const MainApp = () => {
  const {user}=useUser()
  const u = Array.isArray(user) ? user[0] : user;
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setIsAuthenticated(userData.isLoggedIn === true);
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Determine user role for redirect
  const getUserRole = () => {
    if (user) {
      const u = Array.isArray(user) ? user[0] : user;
      const roleValue = u?.rol ?? u?.cargo;
      return roleValue != null ? Number(roleValue) : undefined;
    }
    return undefined;
  };

  const userRole = getUserRole();

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={userRole === 3 ? "/inventario" : "/"} replace />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={userRole === 3 ? "/inventario" : "/"} replace />} />
        
        <Route element={<ProtectedRoute allowedRoles={[u?.rol]} />}>
          <Route path="/" element={userRole === 3 ? <Navigate to="/inventario" replace /> :
            <div className="d-flex">
              <Sidebar 
                isCollapsed={sidebarCollapsed} 
                toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
                onLogout={handleLogout}
              />
              <main 
                className="flex-grow-1 transition-all"
                style={{
                  marginLeft: sidebarCollapsed ? '70px' : '250px',
                  transition: 'margin-left 0.3s ease',
                  minHeight: '100vh'
                }}
              >
                <Header />
                <div className="content-wrapper">
                  <Dashboard />
                </div>
              </main>
            </div>
          } />
          <Route path="/productos" element={
            <div className="d-flex">
              <Sidebar 
                isCollapsed={sidebarCollapsed} 
                toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
                onLogout={handleLogout}
              />
              <main className="flex-grow-1 transition-all"
                style={{
                  marginLeft: sidebarCollapsed ? '70px' : '250px',
                  transition: 'margin-left 0.3s ease',
                  minHeight: '100vh'
                }}
              >
                <Header />
                <div className="content-wrapper">
                  <Productos />
                </div>
              </main>
            </div>
          } />
          <Route path="/materia-prima" element={
            <div className="d-flex">
              <Sidebar 
                isCollapsed={sidebarCollapsed} 
                toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
                onLogout={handleLogout}
              />
              <main className="flex-grow-1 transition-all"
                style={{
                  marginLeft: sidebarCollapsed ? '70px' : '250px',
                  transition: 'margin-left 0.3s ease',
                  minHeight: '100vh'
                }}
              >
                <Header />
                <div className="content-wrapper">
                  <MateriaPrima />
                </div>
              </main>
            </div>
          } />
          <Route path="/produccion" element={
            <div className="d-flex">
              <Sidebar 
                isCollapsed={sidebarCollapsed} 
                toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
                onLogout={handleLogout}
              />
              <main className="flex-grow-1 transition-all"
                style={{
                  marginLeft: sidebarCollapsed ? '70px' : '250px',
                  transition: 'margin-left 0.3s ease',
                  minHeight: '100vh'
                }}
              >
                <Header />
                <div className="content-wrapper">
                  <Produccion />
                </div>
              </main>
            </div>
          } />
          <Route path="/ventas" element={
            <div className="d-flex">
              <Sidebar 
                isCollapsed={sidebarCollapsed} 
                toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
                onLogout={handleLogout}
              />
              <main className="flex-grow-1 transition-all"
                style={{
                  marginLeft: sidebarCollapsed ? '70px' : '250px',
                  transition: 'margin-left 0.3s ease',
                  minHeight: '100vh'
                }}
              >
                <Header />
                <div className="content-wrapper">
                  <Ventas />
                </div>
              </main>
            </div>
          } />
          <Route path="/inventario" element={
            <div className="d-flex">
              <Sidebar 
                isCollapsed={sidebarCollapsed} 
                toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
                onLogout={handleLogout}
              />
              <main className="flex-grow-1 transition-all"
                style={{
                  marginLeft: sidebarCollapsed ? '70px' : '250px',
                  transition: 'margin-left 0.3s ease',
                  minHeight: '100vh'
                }}
              >
                <Header />
                <div className="content-wrapper">
                  <Inventario />
                </div>
              </main>
            </div>
          } />
          <Route path="/movimientos" element={
            <div className="d-flex">
              <Sidebar 
                isCollapsed={sidebarCollapsed} 
                toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
                onLogout={handleLogout}
              />
              <main className="flex-grow-1 transition-all"
                style={{
                  marginLeft: sidebarCollapsed ? '70px' : '250px',
                  transition: 'margin-left 0.3s ease',
                  minHeight: '100vh'
                }}
              >
                <Header />
                <div className="content-wrapper">
                  <Movimientos />
                </div>
              </main>
            </div>
          } />
          <Route path="/proveedores" element={
            <div className="d-flex">
              <Sidebar 
                isCollapsed={sidebarCollapsed} 
                toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
                onLogout={handleLogout}
              />
              <main className="flex-grow-1 transition-all"
                style={{
                  marginLeft: sidebarCollapsed ? '70px' : '250px',
                  transition: 'margin-left 0.3s ease',
                  minHeight: '100vh'
                }}
              >
                <Header />
                <div className="content-wrapper">
                  <Proveedores />
                </div>
              </main>
            </div>
          } />
          <Route path="/ubicaciones" element={
            <div className="d-flex">
              <Sidebar 
                isCollapsed={sidebarCollapsed} 
                toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
                onLogout={handleLogout}
              />
              <main className="flex-grow-1 transition-all"
                style={{
                  marginLeft: sidebarCollapsed ? '70px' : '250px',
                  transition: 'margin-left 0.3s ease',
                  minHeight: '100vh'
                }}
              >
                <Header />
                <div className="content-wrapper">
                  <Ubicaciones />
                </div>
              </main>
            </div>
          } />
          <Route path="/reportes" element={
            <div className="d-flex">
              <Sidebar 
                isCollapsed={sidebarCollapsed} 
                toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
                onLogout={handleLogout}
              />
              <main className="flex-grow-1 transition-all"
                style={{
                  marginLeft: sidebarCollapsed ? '70px' : '250px',
                  transition: 'margin-left 0.3s ease',
                  minHeight: '100vh'
                }}
              >
                <Header />
                <div className="content-wrapper">
                  <Reportes />
                </div>
              </main>
            </div>
          } />
          <Route path="/configuracion" element={
            <div className="d-flex">
              <Sidebar 
                isCollapsed={sidebarCollapsed} 
                toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
                onLogout={handleLogout}
              />
              <main className="flex-grow-1 transition-all"
                style={{
                  marginLeft: sidebarCollapsed ? '70px' : '250px',
                  transition: 'margin-left 0.3s ease',
                  minHeight: '100vh'
                }}
              >
                <Header />
                <div className="content-wrapper">
                  <Configuracion />
                </div>
              </main>
            </div>
          } />
          {/* Ruta exclusiva para rol 3 (empleado) */}
          <Route path="/empleado/solicitudes" element={
            <RoleProtectedRoute allowedRoles={[3]}>
              <div className="d-flex">
                <Sidebar 
                  isCollapsed={sidebarCollapsed} 
                  toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
                  onLogout={handleLogout}
                />
                <main className="flex-grow-1 transition-all"
                  style={{
                    marginLeft: sidebarCollapsed ? '70px' : '250px',
                    transition: 'margin-left 0.3s ease',
                    minHeight: '100vh'
                  }}
                >
                  <Header />
                  <div className="content-wrapper">
                    <EmpleadoSolicitudes />
                  </div>
                </main>
              </div>
             </RoleProtectedRoute>
          } />
        </Route>
      </Routes>
    </div>
  );
};

export default MainApp;
