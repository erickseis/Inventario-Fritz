import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'producto', title: 'Nuevo producto agregado', time: 'Hace 5 minutos', icon: 'bi-box', color: 'primary', read: false },
    { id: 2, type: 'venta', title: 'Venta completada', time: 'Hace 1 hora', icon: 'bi-check-circle', color: 'success', read: false },
    { id: 3, type: 'stock', title: 'Stock bajo en A1001', time: 'Ayer', icon: 'bi-exclamation-triangle', color: 'warning', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? ({ ...n, read: true }) : n));

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
      '/productos': 'Gestión de Productos',
      '/inventario': 'Inventario',
      '/movimientos': 'Movimientos',
      '/proveedores': 'Proveedores',
      '/empleado/solicitudes': 'Solicitudes de Empleado'
    };
    return titles[location.pathname] || 'Dashboard';
  };

  const getPageIcon = () => {
    const icons = {
      '/': 'bi-speedometer2',
      '/productos': 'bi-box-seam',
      '/inventario': 'bi-archive',
      '/movimientos': 'bi-arrow-left-right',
      '/proveedores': 'bi-truck',
      '/empleado/solicitudes': 'bi-people'
    };
    return icons[location.pathname] || 'bi-speedometer2';
  };

  return (
    <header
      className="d-flex justify-content-between align-items-center p-3 shadow-sm mb-3"
      style={{
       background: 'linear-gradient(90deg,rgba(13, 13, 14, 0) 0%, rgb(231, 233, 235) 100%)',
        border: '1px solid #e9ecef'
      }}
    >
      <div className="container d-flex justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
        <i className={`bi ${getPageIcon()} text-primary`}></i>
        <h1 className="h5 mb-0">{getPageTitle()}</h1>
        </div>
        <div className="d-flex align-items-center gap-3">
        <div className="input-group" style={{ width: '320px' }}>
          <span className="input-group-text bg-white" id="search-addon">
            <i className="bi bi-search text-muted"></i>
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
          <button
            type="button"
            className="btn btn-light position-relative d-flex align-items-center"
            onClick={toggleNotifications}
            aria-label="Notificaciones"
            aria-haspopup="true"
            aria-expanded={showNotifications}
          >
            <i className="bi bi-bell"></i>
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                {unreadCount}
                <span className="visually-hidden">notificaciones no leídas</span>
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="notification-dropdown position-absolute end-0 mt-2" style={{ width: '320px', zIndex: 1000 }}>
              <div className="card shadow-sm">
                <div className="card-header bg-white d-flex align-items-center gap-2">
                  <i className="bi bi-bell text-warning"></i>
                  <h6 className="mb-0">Notificaciones</h6>
                  <button className="btn btn-sm btn-outline-secondary ms-auto" onClick={markAllRead} disabled={unreadCount===0}>Marcar todas como leídas</button>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush list-body">
                    {notifications.length === 0 && (
                      <div className="text-center text-muted small py-3">Sin notificaciones</div>
                    )}
                    {notifications.map(n => (
                      <button key={n.id} type="button" className="list-group-item list-group-item-action d-flex align-items-start py-2" onClick={() => markRead(n.id)}>
                        <div className={`bg-${n.color} rounded-circle d-flex align-items-center justify-content-center me-3`} style={{ width: '30px', height: '30px' }}>
                          <i className={`bi ${n.icon} text-white`} style={{ fontSize: '0.8rem' }}></i>
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1 small d-flex align-items-center gap-2">
                            <strong className="text-wrap">{n.title}</strong>
                            {!n.read && <span className="unread-dot"></span>}
                          </p>
                          <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>{n.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="card-footer text-center py-2">
                  <a href="#" className="text-decoration-none small">Ver todas las notificaciones</a>
                </div>
              </div>
            </div>
          )}
        </div>
        <div
          className="rounded-circle d-flex align-items-center justify-content-center border"
          style={{ width: '40px', height: '40px', background: '#ffffffaa' }}
          title="Perfil"
        >
          <i className="bi bi-person fs-5"></i>
        </div>
        </div>
      </div>
      <style jsx>{`
        .input-group .form-control { border-left: 0; }
        .input-group .input-group-text { border-right: 0; }
        .notification-dropdown .list-body { max-height: 260px; overflow: auto; }
        .list-group-item-action:hover { background:rgb(15, 226, 15); }
        .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #dc3545; display: inline-block; }
      `}</style>
    </header>
  );
};

export default Header;