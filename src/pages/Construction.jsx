import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Construction = ({ pageName = "Área" }) => {
  return (
    <div
      className="container-fluid d-flex align-items-center justify-content-center"
      style={{ minHeight: "80vh" }}
    >
      <div className="text-center">
        <div className="mb-4">
          <i
            className="bi bi-cone-striped"
            style={{
              fontSize: "5rem",
              color: "#ffc107",
              animation: "pulse 2s infinite",
            }}
          ></i>
        </div>

        <h1 className="display-4 fw-bold text-primary mb-3">{pageName}</h1>

        <h2 className="h4 text-muted mb-4">
          <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
          Área en Construcción
        </h2>

        <p
          className="lead text-secondary mb-4"
          style={{ maxWidth: "600px", margin: "0 auto" }}
        >
          Estamos trabajando arduamente para traerte esta funcionalidad. Pronto
          estará disponible con todas las características que necesitas.
        </p>

        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link to="/" className="btn btn-primary btn-lg">
            <i className="bi bi-house-door me-2"></i>
            Volver al Inicio
          </Link>

          <button
            className="btn btn-outline-secondary btn-lg"
            onClick={() => window.history.back()}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Regresar
          </button>
        </div>

        <div className="mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted mt-2">Próximamente...</p>
        </div>
      </div>
    </div>
  );
};

export default Construction;
