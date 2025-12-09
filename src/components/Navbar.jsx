import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const navItems = [
    { path: "/", label: "Dashboard", icon: "bi-speedometer2" },
    { path: "/productos", label: "Productos", icon: "bi-box-seam" },
    { path: "/materia-prima", label: "Materia Prima", icon: "bi-nut" },
    { path: "/produccion", label: "Producción", icon: "bi-gear" },
    { path: "/ventas", label: "Ventas", icon: "bi-cash-coin" },
  ];

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark shadow-sm"
      style={{
        background: "linear-gradient(90deg, #0d6efd 0%, #6ea8fe 100%)",
        position: "sticky",
        top: 0,
        zIndex: 1080,
      }}
    >
      <div className="container-fluid">
        <Link
          className="navbar-brand fw-semibold d-flex align-items-center gap-2"
          to="/"
        >
          <i className="bi bi-box-seam"></i>
          <span>Inventario Fritz</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item me-1">
                <Link
                  className={`nav-link d-flex align-items-center gap-2 ${location.pathname === item.path ? "active" : ""}`}
                  to={item.path}
                >
                  <i className={`bi ${item.icon}`}></i>
                  <span className="fw-semibold">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Right slot (optional) */}
          <div className="d-none d-lg-flex align-items-center gap-2">
            <span className="badge bg-light text-dark border">v1.0</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .navbar .nav-link { border-radius: .5rem; padding: .5rem .75rem; }
        .navbar .nav-link:hover { background: rgba(255,255,255,.15); }
        .navbar .nav-link.active { background: rgba(0,0,0,.15); font-weight: 600; }
      `}</style>
    </nav>
  );
};

export default Navbar;
