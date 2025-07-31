import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = (e) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  const getPageTitle = () => {
    const titles = {
      '/': 'Dashboard',
      '/productos': 'Gestion de Productos',
      '/inventario': 'Inventario',
      '/movimientos': 'Movimientos',
      '/proveedores': 'Proveedores'
    };
    return titles[location.pathname] || 'Dashboard';
  };

  return (
    <header className="bg-white shadow-sm d-flex justify-content-between align-items-center p-3 border-bottom">
      <h1 className="h3 mb-0">{getPageTitle()}</h1>
      <div className="d-flex align-items-center gap-3">
        <div className="input-group" style={{ width: '300px' }}>
          <span className="input-group-text" id="search-addon">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar"
            aria-label="Buscar"
            aria-describedby="search-addon"
          />
        </div>
        <div className="position-relative notification-container">
          <i className="bi bi-bell-fill fs-5" style={{ color: 'black', cursor: 'pointer' }} onClick={toggleNotifications}></i>
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
            2
            <span className="visually-hidden">notificaciones no leídas</span>
          </span>
          {showNotifications && (
            <div className="notification-dropdown position-absolute end-0 mt-2" style={{ width: '300px', zIndex: 1000 }}>
              <div className="card shadow">
                <div className="card-header bg-light">
                  <h6 className="mb-0">Notificaciones</h6>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    <div className="list-group-item d-flex align-items-start py-2">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '30px', height: '30px' }}>
                        <i className="bi bi-box text-white" style={{ fontSize: '0.8rem' }}></i>
                      </div>
                      <div>
                        <p className="mb-1 small"><strong>Nuevo producto agregado</strong></p>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>Hace 5 minutos</p>
                      </div>
                    </div>
                    <div className="list-group-item d-flex align-items-start py-2">
                      <div className="bg-success rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '30px', height: '30px' }}>
                        <i className="bi bi-check-circle text-white" style={{ fontSize: '0.8rem' }}></i>
                      </div>
                      <div>
                        <p className="mb-1 small"><strong>Venta completada</strong></p>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>Hace 1 hora</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-footer text-center py-2">
                  <a href="#" className="text-decoration-none small">Ver todas las notificaciones</a>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
          <i className="bi bi-person text-white fs-5"></i>
        </div>
      </div>
    </header>
  );
};

export default Header;