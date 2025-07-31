import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoFritz from '../assets/image/logo-fritz-web.png'

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'bi-speedometer2' },
    { path: '/productos', label: 'Productos', icon: 'bi-box-seam' },
    { path: '/inventario', label: 'Inventario', icon: 'bi-archive' },
    { path: '/movimientos', label: 'Movimientos', icon: 'bi bi-arrow-left-right' },
    { path: '/proveedores', label: 'Proveedores', icon: 'bi bi-truck' },
    { path: '/ubicaciones', label: 'Ubicaciones', icon: 'bi bi-geo-alt' },
    { path: '/reportes', label: 'Reportes', icon: 'bi bi-list-columns-reverse' },
    { path: '/configuracion', label: 'Configuración', icon: 'bi-gear' }
  ];



  return (
    <>
      {/* Overlay para móviles */}
      {!isCollapsed && (
        <div 
          className="sidebar-overlay d-lg-none" 
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1040
          }}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
        style={{
          width: isCollapsed ? '70px' : '250px',
          minHeight: '100vh',
          transition: 'all 0.3s ease',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1050
        }}
      >
        {/* Header del Sidebar */}
        <div className="sidebar-header p-3 text-white d-flex align-items-center justify-content-between">
          {!isCollapsed && (
            <h5 className="mb-0 fw-bold">
              <img style={{width: '100px'}} src={logoFritz} alt="Logo" className="logo" />
            </h5>
          )}
          <button 
            className="btn-toggle-sidebar"
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <i className={`bi ${isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
          </button>
        </div>

        {/* Navegación */}
        <nav className="sidebar-nav p-3">
          <ul className="nav flex-column" style={{ listStyle: 'none', padding: 0 }}>
            {navItems.map(item => (
              <li key={item.path} className="nav-item mb-2">
                <Link 
                  to={item.path}
                  className={`nav-link d-flex align-items-center text-white ${
                    location.pathname === item.path ? 'active' : ''
                  }`}
                >
                  <i className={`bi ${item.icon} me-3`} style={{ fontSize: '1.2rem' }}></i>
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer del Sidebar */}
        <div 
          className="sidebar-footer p-3 text-white"
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.8rem'
          }}
        >
          {!isCollapsed && (
            <div className="text-center">
              <small>© 2025 Inventario Fritz</small>
            </div>
          )}
        </div>
      </div>

      {/* Estilos CSS personalizados */}
      <style jsx>{`
        .sidebar {
          overflow-y: auto;
        }
        
        .sidebar::-webkit-scrollbar {
          width: 4px;
        }
        
        .sidebar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .sidebar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }
        
        @media (max-width: 991px) {
          .sidebar {
            transform: translateX(-100%);
          }
          
          .sidebar:not(.collapsed) {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
