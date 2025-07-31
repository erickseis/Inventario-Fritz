import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/productos', label: 'Productos', icon: '📦' },
    { path: '/materia-prima', label: 'Materia Prima', icon: '🔧' },
    { path: '/produccion', label: 'Producción', icon: '⚙️' },
    { path: '/ventas', label: 'Ventas', icon: '💰' }
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-box-seam"></i> Inventario Fritz
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {navItems.map(item => (
              <li key={item.path} className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  to={item.path}
                >
                  <span className="me-1">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
