import { useEffect, useState } from "react";
import SolicitudesTable from "../components/SolicitudesTable";
import SolicitudRequerimientoForm from "../components/SolicitudRequerimientoForm";
import { useUser } from "../hooks/useUser";
import { obtenerRequerimientos } from "../service/connection";

const Inventario = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const u = Array.isArray(user) ? user[0] : user;
  const roleValue = u?.rol ?? u?.cargo;
  const numericRole = roleValue != null ? Number(roleValue) : undefined;

  const fetchRequerimientos = async () => {
    try {
      const data = await obtenerRequerimientos();
      setSolicitudes(data);
    } catch (error) {
      console.error("Error al obtener requerimientos:", error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRequerimientos();
  }, []);
  const formatearFecha = (fecha) => {
    if (!fecha) return "-";

    try {
      const date = new Date(fecha);
      if (Number.isNaN(date.getTime())) return fecha; // Si no es una fecha válida, devuelve el valor original

      const dia = String(date.getDate()).padStart(2, "0");
      const mes = String(date.getMonth() + 1).padStart(2, "0"); // +1 porque los meses empiezan en 0
      const año = date.getFullYear();

      return `${dia}-${mes}-${año}`;
    } catch (error) {
      console.error("Error formateando fecha:", error);
      return fecha;
    }
  };
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando datos...</p>
      </div>
    );
  }
  return (
    <div className="container py-3">
      <div className="card border-0 shadow-sm overflow-hidden">
        <div
          className="p-4"
          style={{
            background: "linear-gradient(90deg, #198754 0%, #63c39b 100%)",
          }}
        >
          <h5 className="mb-0 text-white d-flex align-items-center gap-2">
            <i className="bi bi-box-seam"></i>
            Inventario
          </h5>
          <small className="text-white-50">
            Gestione requerimientos y consulte solicitudes registradas
          </small>
        </div>

        <div className="card-body">
          <div className="row g-4">
            <div className="col-12">
              <div className="d-flex align-items-center mb-2">
                <i className="bi bi-clipboard-check me-2 text-success"></i>
                <h6 className="mb-0">Solicitudes registradas</h6>
              </div>
              <SolicitudesTable
                data={solicitudes}
                formatearFecha={formatearFecha}
                fetchRequerimientos={fetchRequerimientos}
              />
            </div>

            {numericRole === 3 && (
              <div className="col-12">
                <div className="d-flex align-items-center mb-2 mt-2">
                  <i className="bi bi-journal-plus me-2 text-primary"></i>
                  <h6 className="mb-0">Nueva Solicitud (Vendedor)</h6>
                </div>
                <div className="p-3 border rounded-3">
                  <SolicitudRequerimientoForm
                    fetchRequerimientos={fetchRequerimientos}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventario;
