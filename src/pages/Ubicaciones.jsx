import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { obtenerClientesConCoordenadas } from "../service/connection";

// Fix para los iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const Ubicaciones = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCliente, setSelectedCliente] = useState(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerClientesConCoordenadas();
      // Filtrar y validar coordenadas
      const clientesValidos = data.filter((cliente) => {
        const lat = Number.parseFloat(cliente.latitud);
        const lng = Number.parseFloat(cliente.longitud);
        return (
          !Number.isNaN(lat) &&
          !Number.isNaN(lng) &&
          lat >= -90 &&
          lat <= 90 &&
          lng >= -180 &&
          lng <= 180
        );
      });
      setClientes(clientesValidos);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los clientes. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.cli_des?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.co_cli?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.direc1?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calcular el centro del mapa basado en los clientes
  const mapCenter =
    clientes.length > 0
      ? [
          clientes.reduce((sum, c) => sum + Number.parseFloat(c.latitud), 0) /
            clientes.length,
          clientes.reduce((sum, c) => sum + Number.parseFloat(c.longitud), 0) /
            clientes.length,
        ]
      : [10.4806, -66.9036]; // Caracas, Venezuela por defecto

  const handleClienteClick = (cliente) => {
    setSelectedCliente(cliente);
    setSearchTerm(cliente.cli_des);
  };

  if (loading) {
    return (
      <div
        className="container-fluid py-3"
        style={{ minHeight: "calc(100vh - 120px)" }}
      >
        <div className="d-flex justify-content-center align-items-center h-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container-fluid py-3"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
        minHeight: "calc(100vh - 120px)",
      }}
    >
      {/* Header */}
      <div className="card border-0 shadow-sm overflow-hidden mb-3">
        <div
          className="p-4 d-flex align-items-center justify-content-between"
          style={{
            background: "linear-gradient(90deg, #0d6efd 0%, #0dcaf0 100%)",
          }}
        >
          <div className="d-flex align-items-center gap-3 text-white">
            <i className="bi bi-geo-alt fs-3" />
            <div>
              <h5 className="mb-0">Ubicaciones de Clientes</h5>
              <small className="text-white-75">
                {clientes.length} clientes con ubicación registrada
              </small>
            </div>
          </div>
          <button
            className="btn btn-light btn-sm"
            onClick={fetchClientes}
            type="button"
          >
            <i className="bi bi-arrow-clockwise me-2" />
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger shadow-sm" role="alert">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </div>
      )}

      <div className="row g-3">
        {/* Sidebar con lista de clientes */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm" style={{ height: "70vh" }}>
            <div className="card-header bg-white">
              <h6 className="mb-0">
                <i className="bi bi-list-ul me-2" />
                Clientes
              </h6>
            </div>
            <div className="card-body p-0">
              {/* Búsqueda */}
              <div className="p-3 border-bottom">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-search" />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setSearchTerm("")}
                      type="button"
                    >
                      <i className="bi bi-x" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lista de clientes */}
              <div
                className="overflow-auto"
                style={{ maxHeight: "calc(70vh - 140px)" }}
              >
                {filteredClientes.length === 0 ? (
                  <div className="p-3 text-center text-muted">
                    {searchTerm
                      ? "No se encontraron clientes"
                      : "No hay clientes con ubicación"}
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {filteredClientes.map((cliente) => (
                      <button
                        key={cliente.co_cli}
                        className={`list-group-item list-group-item-action ${
                          selectedCliente?.co_cli === cliente.co_cli
                            ? "active"
                            : ""
                        }`}
                        onClick={() => handleClienteClick(cliente)}
                        type="button"
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="text-start">
                            <h6 className="mb-1">
                              {cliente.cli_des || "Sin nombre"}
                            </h6>
                            <small className="text-muted">
                              <i className="bi bi-hash me-1" />
                              {cliente.co_cli}
                            </small>
                            {cliente.direc1 && (
                              <div className="small mt-1">
                                <i className="bi bi-geo-alt me-1" />
                                {cliente.direc1}
                              </div>
                            )}
                          </div>
                          <i className="bi bi-chevron-right" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="col-lg-8">
          <div
            className="card border-0 shadow-sm"
            style={{ height: "70vh", overflow: "hidden" }}
          >
            <div className="card-body p-0">
              {clientes.length === 0 ? (
                <div className="d-flex justify-content-center align-items-center h-100">
                  <div className="text-center text-muted">
                    <i className="bi bi-map fs-1 d-block mb-2" />
                    <p>No hay clientes con ubicación para mostrar</p>
                  </div>
                </div>
              ) : (
                <MapContainer
                  center={mapCenter}
                  zoom={selectedCliente ? 15 : 8}
                  style={{ height: "100%", width: "100%" }}
                  key={selectedCliente?.co_cli || "default"}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {(selectedCliente ? [selectedCliente] : filteredClientes).map(
                    (cliente) => (
                      <Marker
                        key={cliente.co_cli}
                        position={[
                          Number.parseFloat(cliente.latitud),
                          Number.parseFloat(cliente.longitud),
                        ]}
                      >
                        <Popup maxWidth={300}>
                          <div>
                            <h6 className="fw-bold mb-2">
                              {cliente.cli_des || "Sin nombre"}
                            </h6>
                            <div className="small">
                              <div className="mb-1">
                                <strong>Código:</strong> {cliente.co_cli}
                              </div>
                              {cliente.direc1 && (
                                <div className="mb-1">
                                  <strong>Dirección:</strong> {cliente.direc1}
                                </div>
                              )}
                              {cliente.direc2 && (
                                <div className="mb-1">
                                  <strong>Dirección 2:</strong> {cliente.direc2}
                                </div>
                              )}
                              {cliente.telefonos && (
                                <div className="mb-1">
                                  <strong>Teléfono:</strong> {cliente.telefonos}
                                </div>
                              )}
                              {cliente.email && (
                                <div className="mb-1">
                                  <strong>Email:</strong> {cliente.email}
                                </div>
                              )}
                              <div className="mt-2 text-muted">
                                <small>
                                  📍 {cliente.latitud}, {cliente.longitud}
                                </small>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ),
                  )}
                </MapContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-3 mt-2">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0 bg-primary bg-opacity-10 rounded p-3">
                  <i className="bi bi-people fs-3 text-primary" />
                </div>
                <div className="ms-3">
                  <h6 className="text-muted mb-0">Total Clientes</h6>
                  <h3 className="mb-0">{clientes.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0 bg-success bg-opacity-10 rounded p-3">
                  <i className="bi bi-geo-alt-fill fs-3 text-success" />
                </div>
                <div className="ms-3">
                  <h6 className="text-muted mb-0">Filtrados</h6>
                  <h3 className="mb-0">{filteredClientes.length}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0 bg-info bg-opacity-10 rounded p-3">
                  <i className="bi bi-cursor-fill fs-3 text-info" />
                </div>
                <div className="ms-3">
                  <h6 className="text-muted mb-0">Seleccionado</h6>
                  <h3 className="mb-0">{selectedCliente ? "1" : "Todos"}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ubicaciones;
