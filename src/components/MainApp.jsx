import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import Productos from '../pages/Productos';
import MateriaPrima from '../pages/MateriaPrima';
import Produccion from '../pages/Produccion';
import Ventas from '../pages/Ventas';
import Header from './Header';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProtectedRoute from './ProtectedRoute';

const MainApp = () => {
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

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={
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
        </Route>
      </Routes>
    </div>
  );
};

export default MainApp;
