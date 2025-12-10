import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logoFritz from "../assets/image/logo-fritz-web.png";
import { useUser } from "../hooks/useUser";
import { obtenerCargos } from "../service/connection";

const Sidebar = ({ isCollapsed, toggleSidebar, onLogout }) => {
  const location = useLocation();
  const [cargos, setCargos] = useState([]);

  async function fetchCargos() {
    try {
      const response = await obtenerCargos();
      setCargos(response);
    } catch (error) {
      console.error("Error al obtener cargos:", error);
    }
  }

  useEffect(() => {
    fetchCargos();
  }, []);
  console.log("cargos", cargos);
  const { user, loading, isAuthenticated } = useUser();

  console.log("usuario logueado", user);

  // Compatibilidad con user como arreglo u objeto
  const u = Array.isArray(user) ? user[0] : user;
  const roleValue = u?.rol ?? u?.cargo;
  const numericRole = roleValue != null ? Number(roleValue) : undefined;

  const navItemsBase = [
    { path: "/", label: "Dashboard", icon: "bi-speedometer2" },
    { path: "/productos", label: "Productos", icon: "bi-box-seam" },
    { path: "/inventario", label: "Inventario", icon: "bi-archive" },
    {
      path: "/movimientos",
      label: "Movimientos",
      icon: "bi bi-arrow-left-right",
    },
    {
      path: "/control-interno",
      label: "Control Interno",
      icon: "bi-clipboard-check",
    },
    { path: "/pronostico", label: "Predictivo", icon: "bi bi-graph-up" },
    // { href: '/st/' ,label: 'Pronóstico', icon: 'bi bi-graph-up' },
    { path: "/proveedores", label: "Proveedores", icon: "bi bi-truck" },
    { path: "/ubicaciones", label: "Ubicaciones", icon: "bi bi-geo-alt" },
    {
      path: "/reportes",
      label: "Reportes",
      icon: "bi bi-list-columns-reverse",
    },
    { path: "/configuracion", label: "Configuración", icon: "bi-gear" },
  ];

  // Solo para rol 3 (empleado)
  const navItems =
    numericRole === 3
      ? [
          // ...navItemsBase,
          { path: "/inventario", label: "Inventario", icon: "bi-archive" },
        ]
      : navItemsBase;

  if (loading || !isAuthenticated) return <div>Cargando...</div>;

  return (
    <>
      {/* Overlay para móviles */}
      {!isCollapsed && (
        <div
          className="sidebar-overlay d-lg-none"
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1040,
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar ${isCollapsed ? "collapsed" : ""}`}
        style={{
          width: isCollapsed ? "72px" : "260px",
          minHeight: "100vh",
          transition: "all 0.25s ease",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1050,
          background:
            "linear-gradient(180deg,rgba(13, 13, 14, 0) 0%, rgb(231, 233, 235) 100%)",
          boxShadow: "0 0 24px rgba(255, 255, 255, 0.25)",
        }}
      >
        {/* Header del Sidebar */}
        <div
          className="sidebar-header p-3 text-white d-flex align-items-center justify-content-between border-bottom"
          style={{ borderColor: "rgba(255,255,255,.08)" }}
        >
          {!isCollapsed && (
            <h5 className="mb-0 fw-bold">
              <img
                style={{ width: "89px" }}
                src={logoFritz}
                alt="Logo"
                className="logo"
              />
            </h5>
          )}
          <button
            className="btn btn-sm btn-outline-dark rounded-circle d-flex align-items-center justify-content-center "
            onClick={toggleSidebar}
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            style={{
              width: isCollapsed ? 36 : 34,
              height: isCollapsed ? 36 : 34,
              opacity: 0.4,
            }}
          >
            <i
              className={`text-dark bi ${isCollapsed ? "bi-chevron-right" : "bi-chevron-left"}`}
            ></i>
          </button>
        </div>

        {/* Navegación */}
        <nav className="sidebar-nav p-3">
          <ul
            className="nav flex-column"
            style={{ listStyle: "none", padding: 0 }}
          >
            {navItems.map((item) => (
              <li key={item.path || item.href} className="nav-item ">
                {item.href ? (
                  <a
                    href={item.href}
                    className={`nav-link d-flex align-items-center text-white`}
                  >
                    <i
                      className={`bi ${item.icon} me-3`}
                      style={{ fontSize: "1.15rem" }}
                    ></i>
                    {!isCollapsed && (
                      <span className="fw-semibold">{item.label}</span>
                    )}
                  </a>
                ) : (
                  <Link
                    style={
                      item.label === "Proveedores" ||
                      item.label === "Reportes"
                        ? { opacity: 0.4 }
                        : {}
                    }
                    to={item.path}
                    className={`nav-link d-flex align-items-center text-white ${
                      location.pathname === item.path ? "active" : ""
                    }`}
                  >
                    <i
                      className={`bi ${item.icon} me-3`}
                      style={{ fontSize: "1.15rem" }}
                    ></i>
                    {!isCollapsed && (
                      <span className="fw-semibold">{item.label}</span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer del Sidebar */}
        <div
          className="sidebar-footer p-3 text-white"
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            fontSize: "0.8rem",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {u && (
            <div className="mt-auto p-3 border-top">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <i className="bi bi-person-circle fs-4 text-info"></i>
                </div>
                {!isCollapsed && (
                  <div className="flex-grow-1 ms-2">
                    <div className="text-dark small">
                      {(u?.nombre || "").charAt(0).toUpperCase() +
                        (u?.nombre || "").slice(1).toLowerCase()}{" "}
                      {(u?.apellido || "").charAt(0).toUpperCase() +
                        (u?.apellido || "").slice(1).toLowerCase()}
                    </div>
                    <div className="text-dark small">
                      {cargos
                        ?.filter((item) => Number(item.id) === Number(u?.cargo))
                        .map((items) => items.nombre_cargo)}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={onLogout}
                className={`btn btn-outline-dark btn-sm w-100 mt-2 ${isCollapsed ? "p-1" : ""}`}
                title="Cerrar sesión"
              >
                <i className="bi bi-box-arrow-right"></i>
                {!isCollapsed && <span className="ms-1">Cerrar sesión</span>}
              </button>
            </div>
          )}
          {!isCollapsed && (
            <div className="text-center">
              <small className="text-dark opacity-50">
                {" "}
                2025 Inventario Fritz
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Estilos CSS personalizados */}
      <style jsx>{`
        .sidebar { overflow-y: auto; }
        
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
        
        .sidebar .nav-link {
          border-radius: .5rem;
          padding: .6rem .75rem;
          transition: background-color .2s ease, color .2s ease;
        }
        .sidebar .nav-link:hover { background: rgba(255,255,255,.06); }
        .sidebar .nav-link.active { background: rgba(13,110,253,.2); color: #fff; }
        .sidebar .btn-toggle-sidebar:hover { opacity: 1; }

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
