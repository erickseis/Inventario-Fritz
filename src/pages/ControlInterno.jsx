import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ajustarItemControl,
  consultarDatosProfit,
  crearItemControl,
  crearListaControl,
  obtenerHistorialItemControl,
  obtenerListasControl,
  resetearItemControl,
} from "../service/connection";

const formatDate = (value) => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-VE", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const formatNumber = (value) => Number(value || 0).toLocaleString("es-VE");

const Modal = ({ title, show, onClose, footer, children }) => {
  if (!show) return null;
  return (
    <div
      className="modal-backdrop fade show"
      style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div
            className="modal-content"
            style={{ backgroundColor: "#ffffff", color: "#212529" }}
          >
            <div
              className="modal-header"
              style={{
                backgroundColor: "#ffffff",
                borderBottom: "1px solid #dee2e6",
              }}
            >
              <h5 className="modal-title" style={{ color: "#212529" }}>
                {title}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Cerrar"
              />
            </div>
            <div
              className="modal-body"
              style={{ backgroundColor: "#ffffff", color: "#212529" }}
            >
              {children}
            </div>
            {footer && (
              <div
                className="modal-footer"
                style={{
                  backgroundColor: "#ffffff",
                  borderTop: "1px solid #dee2e6",
                }}
              >
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ControlInterno = () => {
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [inputValues, setInputValues] = useState({});
  const [historyMap, setHistoryMap] = useState({});
  const [historyLoading, setHistoryLoading] = useState({});

  // Modal para consultar datos de Profit
  const [showConsultaModal, setShowConsultaModal] = useState(false);
  const [consultaForm, setConsultaForm] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    co_art: "",
  });
  const [consultando, setConsultando] = useState(false);
  const [datosConsultados, setDatosConsultados] = useState(null);
  const [yaConsultado, setYaConsultado] = useState(false);

  // Modal para crear ítem manual
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemForm, setItemForm] = useState({
    nombre: "",
    cantidad_meta: 0,
  });
  const [saving, setSaving] = useState(false);

  const fetchLists = useCallback(
    async (listIdToSelect = null) => {
      setLoading(true);
      setError(null);
      try {
        const data = await obtenerListasControl();
        setLists(data);
        if (data.length === 0) {
          setSelectedListId(null);
        } else if (listIdToSelect) {
          setSelectedListId(listIdToSelect);
        } else if (
          !selectedListId ||
          !data.some((l) => l.id === selectedListId)
        ) {
          setSelectedListId(data[0].id);
        }
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las listas. Intente nuevamente.");
      } finally {
        setLoading(false);
      }
    },
    [selectedListId],
  );

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const selectedList = useMemo(
    () => lists.find((list) => list.id === selectedListId) ?? null,
    [lists, selectedListId],
  );

  const handleInputChange = (itemId, value) => {
    const numeric = value.replace(/[^0-9]/g, "");
    const clamped =
      numeric === "" ? "" : Math.min(999999, Number.parseInt(numeric, 10));
    setInputValues((prev) => ({
      ...prev,
      [itemId]: clamped === "" ? "" : String(clamped),
    }));
  };

  const handleAdjust = async (itemId, action) => {
    try {
      const quantity = Math.max(1, Number(inputValues[itemId] ?? 1));
      await ajustarItemControl(itemId, { action, quantity });
      await fetchLists(selectedListId);
      setInputValues((prev) => ({ ...prev, [itemId]: "1" }));
      setHistoryMap((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el ítem.");
    }
  };

  const handleReset = async (itemId) => {
    if (!window.confirm("¿Deseas reiniciar el total cargado de este ítem?"))
      return;

    try {
      await resetearItemControl(itemId);
      await fetchLists(selectedListId);
      setHistoryMap((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } catch (err) {
      console.error(err);
      alert("No se pudo reiniciar el ítem.");
    }
  };

  const loadHistory = async (itemId) => {
    setHistoryLoading((prev) => ({ ...prev, [itemId]: true }));
    try {
      const history = await obtenerHistorialItemControl(itemId);
      setHistoryMap((prev) => ({ ...prev, [itemId]: history }));
    } catch (err) {
      console.error(err);
      alert("No se pudo obtener el historial.");
    } finally {
      setHistoryLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const toggleHistory = async (itemId) => {
    if (historyMap[itemId]) {
      setHistoryMap((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } else {
      await loadHistory(itemId);
    }
  };

  const getListProgress = (list) => {
    const totalItems = list.items.length;
    if (totalItems === 0) return { completed: 0, percentage: 0 };
    const completed = list.items.filter(
      (item) =>
        item.cantidad_meta > 0 && item.cantidad_cargada >= item.cantidad_meta,
    ).length;
    const percentage = Math.round((completed / totalItems) * 100);
    return { completed, percentage };
  };

  const getStatusBadge = (list) => {
    const { completed, percentage } = getListProgress(list);
    if (list.items.length === 0)
      return { text: "Sin ítems", className: "bg-secondary" };
    if (completed === list.items.length)
      return { text: "Completado", className: "bg-success" };
    if (percentage >= 50)
      return { text: "En progreso", className: "bg-info text-dark" };
    return { text: "Pendiente", className: "bg-warning text-dark" };
  };

  const handleConsultarProfit = async (e) => {
    e.preventDefault();

    if (!consultaForm.fecha_inicio || !consultaForm.fecha_fin) {
      alert("Por favor ingrese las fechas de inicio y fin.");
      return;
    }

    setConsultando(true);
    try {
      // Convertir fechas YYYY-MM-DD a YYYYMMDD
      const fechaInicio = consultaForm.fecha_inicio.replace(/-/g, "");
      const fechaFin = consultaForm.fecha_fin.replace(/-/g, "");

      const datos = await consultarDatosProfit({
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        co_art: consultaForm.co_art.trim() || null,
      });

      setDatosConsultados(datos);
      setYaConsultado(true);
      setShowConsultaModal(false);

      // Agrupar por factura para crear las listas
      const facturas = agruparPorFactura(datos);
      if (facturas.length > 0) {
        alert(
          `Se encontraron ${facturas.length} transportes. Haz clic en "Cerrar Guía" para guardar.`,
        );
      } else {
        alert("No se encontraron datos para el rango de fechas seleccionado.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al consultar los datos. Intente nuevamente.");
    } finally {
      setConsultando(false);
    }
  };

  const agruparPorFactura = (datos) => {
    const facturaMap = new Map();

    for (const row of datos) {
      const key = row.fact_num;
      if (!facturaMap.has(key)) {
        facturaMap.set(key, {
          fact_num: row.fact_num,
          fec_emis: row.fec_emis,
          co_cli: row.co_cli,
          co_alma: row.co_alma,
          items: [],
        });
      }
      const factura = facturaMap.get(key);
      factura.items.push({
        co_art: row.co_art,
        art_des: row.art_des,
        tot_art: Number(row.tot_art || 0),
        uni_venta: row.uni_venta,
      });
    }

    return Array.from(facturaMap.values());
  };

  const handleCerrarGuia = async () => {
    if (!datosConsultados || datosConsultados.length === 0) {
      alert("No hay datos para cerrar.");
      return;
    }

    if (
      !window.confirm(
        "¿Desea crear las listas de carga con los datos consultados?",
      )
    )
      return;

    try {
      const facturas = agruparPorFactura(datosConsultados);

      for (const factura of facturas) {
        // Crear lista de carga
        const newList = await crearListaControl({
          nombre: `Transporte ${factura.fact_num}`,
          fecha: factura.fec_emis
            ? new Date(factura.fec_emis).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
          referencia: `Guía ${factura.fec_emis || ""} | Cliente: ${factura.co_cli} | Almacén: ${factura.co_alma}`,
        });

        // Crear items para cada artículo
        for (const item of factura.items) {
          await crearItemControl(newList.id, {
            nombre: `${item.art_des} (${item.co_art})`,
            cantidad_meta: Math.round(item.tot_art),
          });
        }
      }

      alert(`Se crearon ${facturas.length} listas de carga exitosamente.`);
      setDatosConsultados(null);
      setYaConsultado(false);
      setConsultaForm({ fecha_inicio: "", fecha_fin: "", co_art: "" });
      await fetchLists();
    } catch (err) {
      console.error(err);
      alert("Error al crear las listas. Intente nuevamente.");
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!selectedListId) return;

    const payload = {
      nombre: itemForm.nombre.trim(),
      cantidad_meta: Math.max(
        0,
        Number.parseInt(itemForm.cantidad_meta, 10) || 0,
      ),
    };
    if (!payload.nombre) {
      alert("El nombre del ítem es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      await crearItemControl(selectedListId, payload);
      setShowItemModal(false);
      setItemForm({ nombre: "", cantidad_meta: 0 });
      await fetchLists(selectedListId);
    } catch (err) {
      console.error(err);
      alert("No se pudo crear el ítem.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="container-fluid py-3"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
        minHeight: "calc(100vh - 120px)",
      }}
    >
      {/* Header con botones */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h4 className="mb-0 text-dark fw-bold">Control Interno</h4>
          <div className="d-flex gap-2">
            {yaConsultado && datosConsultados && (
              <button
                className="btn btn-success btn-sm fw-semibold"
                onClick={handleCerrarGuia}
              >
                <i className="bi bi-check-circle me-1" />
                Cerrar Guía
              </button>
            )}
            <button
              className="btn btn-primary btn-sm fw-semibold"
              onClick={() => setShowConsultaModal(true)}
            >
              <i className="bi bi-search me-1" />
              {yaConsultado ? "Nueva Consulta" : "Consultar Datos"}
            </button>
          </div>
        </div>
      </div>

      <div className="d-flex flex-column flex-lg-row gap-3">
        {/* Lista de transportes */}
        <div
          className="flex-shrink-0"
          style={{ minWidth: "300px", maxWidth: "340px" }}
        >
          <div
            className="card shadow-sm border-0 h-100"
            style={{
              borderRadius: "18px",
              overflow: "hidden",
              background: "#ffffff",
            }}
          >
            <div
              className="card-header text-white"
              style={{
                background: "linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)",
              }}
            >
              <span className="fw-semibold">Listas de Carga</span>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="p-3 text-center text-muted">Cargando...</div>
              ) : error ? (
                <div className="p-3 text-center text-danger">{error}</div>
              ) : lists.length === 0 ? (
                <div className="p-3 text-center text-muted">
                  Aún no hay listas. Consulta datos para comenzar.
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {lists.map((list) => {
                    const progress = getListProgress(list);
                    const badge = getStatusBadge(list);
                    const isActive = list.id === selectedListId;
                    return (
                      <li
                        key={list.id}
                        className={`list-group-item list-group-item-action border-0 ${isActive ? "active shadow-sm" : ""}`}
                        style={{
                          cursor: "pointer",
                          borderLeft: `4px solid ${isActive ? "#0d6efd" : "transparent"}`,
                          transition: "all 0.2s ease",
                          borderRadius: isActive ? "12px" : "8px",
                          margin: "6px 12px",
                          padding: "14px 18px",
                          backgroundColor: isActive ? "#e8f0ff" : "#ffffff",
                        }}
                        onClick={() => setSelectedListId(list.id)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-semibold">{list.nombre}</div>
                            <small className="text-muted">
                              {formatDate(list.fecha)} | {progress.completed}/
                              {list.items.length} ítems
                            </small>
                          </div>
                          <span
                            className={`badge rounded-pill ${badge.className}`}
                          >
                            {badge.text}
                          </span>
                        </div>
                        <div
                          className="progress progress-thin mt-2"
                          style={{ height: "6px" }}
                        >
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${progress.percentage}%`,
                              background:
                                "linear-gradient(135deg, #0dcaf0 0%, #0d6efd 100%)",
                            }}
                            aria-valuenow={progress.percentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Detalles de la lista seleccionada */}
        <div className="flex-grow-1">
          {!selectedList ? (
            <div className="alert alert-info shadow-sm">
              Selecciona una lista de carga o consulta nuevos datos para
              comenzar.
            </div>
          ) : (
            <div
              className="card shadow-sm border-0"
              style={{
                borderRadius: "18px",
                overflow: "hidden",
                background: "#ffffff",
              }}
            >
              <div
                className="card-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2"
                style={{ background: "#ffffff" }}
              >
                <div>
                  <h5 className="mb-1 d-flex align-items-center gap-2">
                    <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill px-3 py-2">
                      {selectedList.items.length} ítems
                    </span>
                    <span className="fw-semibold">{selectedList.nombre}</span>
                  </h5>
                  <div className="text-muted small">
                    {formatDate(selectedList.fecha)}
                    {selectedList.referencia
                      ? ` • ${selectedList.referencia}`
                      : ""}
                  </div>
                </div>
                <button
                  className="btn btn-outline-primary btn-sm fw-semibold"
                  onClick={() => {
                    setShowItemModal(true);
                  }}
                >
                  <i className="bi bi-plus-circle me-1" />
                  Agregar ítem
                </button>
              </div>

              <div
                className="card-body"
                style={{
                  background:
                    "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
                }}
              >
                {selectedList.items.length === 0 ? (
                  <div className="text-center text-muted py-5">
                    <i className="bi bi-archive fs-1 d-block mb-2" />
                    Aún no hay ítems en esta lista.
                  </div>
                ) : (
                  <div className="vstack gap-3">
                    {selectedList.items.map((item) => {
                      const remaining = Math.max(
                        0,
                        item.cantidad_meta - item.cantidad_cargada,
                      );
                      const historyExpanded = !!historyMap[item.id];
                      const status =
                        item.cantidad_meta === 0
                          ? { text: "Libre", className: "bg-secondary" }
                          : item.cantidad_cargada >= item.cantidad_meta
                            ? { text: "Completo", className: "bg-success" }
                            : remaining <= Math.round(item.cantidad_meta * 0.2)
                              ? {
                                  text: "Casi listo",
                                  className: "bg-info text-dark",
                                }
                              : {
                                  text: "Pendiente",
                                  className: "bg-warning text-dark",
                                };

                      const history = historyMap[item.id] || [];
                      const isHistoryLoading = historyLoading[item.id];

                      return (
                        <div
                          key={item.id}
                          className="card border-0 shadow-sm"
                          style={{ borderRadius: "16px", overflow: "hidden" }}
                        >
                          <div
                            className="card-body"
                            style={{
                              borderLeft: `6px solid ${
                                status.className.includes("success")
                                  ? "#198754"
                                  : status.className.includes("info")
                                    ? "#0dcaf0"
                                    : status.className.includes("warning")
                                      ? "#ffc107"
                                      : "#6c757d"
                              }`,
                            }}
                          >
                            <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                              <div>
                                <div className="d-flex align-items-center gap-3 flex-wrap">
                                  <h6 className="mb-0 fw-semibold text-dark">
                                    {item.nombre}
                                  </h6>
                                  <span
                                    className={`badge rounded-pill ${status.className}`}
                                    style={{ fontSize: "0.75rem" }}
                                  >
                                    {status.text}
                                  </span>
                                </div>
                                <div className="text-muted small mt-1">
                                  Total a Cargar:{" "}
                                  <strong>
                                    {formatNumber(item.cantidad_meta)}
                                  </strong>{" "}
                                  • Cargado:{" "}
                                  <strong>
                                    {formatNumber(item.cantidad_cargada)}
                                  </strong>{" "}
                                  • Restante:{" "}
                                  <strong>{formatNumber(remaining)}</strong>
                                </div>
                              </div>

                              <div className="d-flex flex-column flex-md-row align-items-stretch gap-2 flex-wrap">
                                <input
                                  type="number"
                                  className="form-control form-control-sm shadow-sm"
                                  min="1"
                                  value={inputValues[item.id] ?? "1"}
                                  onChange={(e) =>
                                    handleInputChange(item.id, e.target.value)
                                  }
                                  style={{
                                    maxWidth: "110px",
                                    borderRadius: "12px",
                                  }}
                                />
                                <div className="btn-group" role="group">
                                  <button
                                    className="btn btn-sm btn-primary fw-semibold"
                                    onClick={() => handleAdjust(item.id, "add")}
                                  >
                                    <i className="bi bi-plus-lg me-1" />
                                    Agregar
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger fw-semibold"
                                    onClick={() =>
                                      handleAdjust(item.id, "subtract")
                                    }
                                  >
                                    <i className="bi bi-dash-lg me-1" />
                                    Restar
                                  </button>
                                </div>
                                <button
                                  className="btn btn-sm btn-outline-secondary fw-semibold"
                                  onClick={() => toggleHistory(item.id)}
                                >
                                  <i className="bi bi-clock-history me-1" />
                                  Historial
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-dark fw-semibold"
                                  onClick={() => handleReset(item.id)}
                                >
                                  Reset
                                </button>
                              </div>
                            </div>

                            {historyExpanded && (
                              <div className="mt-3 border-top pt-3">
                                <h6 className="small text-uppercase text-muted mb-2">
                                  Historial
                                </h6>
                                {isHistoryLoading ? (
                                  <div className="text-muted small">
                                    Cargando historial...
                                  </div>
                                ) : history.length === 0 ? (
                                  <div className="text-muted small">
                                    Aún no hay movimientos registrados.
                                  </div>
                                ) : (
                                  <ul className="list-unstyled small mb-0">
                                    {history.map((entry) => (
                                      <li key={entry.id} className="mb-1">
                                        <strong>
                                          {entry.tipo === "add"
                                            ? "Se agregaron"
                                            : entry.tipo === "subtract"
                                              ? "Se restaron"
                                              : "Reset"}
                                        </strong>{" "}
                                        {entry.tipo === "reset"
                                          ? `${formatNumber(entry.cantidad)}`
                                          : `${formatNumber(entry.cantidad)} unidades`}{" "}
                                        <span className="text-muted">
                                          ({formatDate(entry.fecha_evento)}{" "}
                                          {new Date(
                                            entry.fecha_evento,
                                          ).toLocaleTimeString("es-VE")}
                                          )
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de consulta */}
      <Modal
        title="Consultar Datos de Profit"
        show={showConsultaModal}
        onClose={() => {
          if (!consultando) {
            setShowConsultaModal(false);
          }
        }}
        footer={
          <>
            <button
              className="btn btn-outline-secondary"
              onClick={() => setShowConsultaModal(false)}
              disabled={consultando}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleConsultarProfit}
              disabled={consultando}
            >
              {consultando ? "Consultando..." : "Consultar"}
            </button>
          </>
        }
      >
        <form onSubmit={handleConsultarProfit}>
          <div className="alert alert-info small mb-3">
            <i className="bi bi-info-circle me-2" />
            Ingrese el rango de fechas para consultar los datos de transportes y
            artículos desde Profit Plus.
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Fecha Inicio</label>
              <input
                type="date"
                className="form-control"
                value={consultaForm.fecha_inicio}
                onChange={(e) =>
                  setConsultaForm((prev) => ({
                    ...prev,
                    fecha_inicio: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Fecha Fin</label>
              <input
                type="date"
                className="form-control"
                value={consultaForm.fecha_fin}
                onChange={(e) =>
                  setConsultaForm((prev) => ({
                    ...prev,
                    fecha_fin: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label">
                Código de Artículo (opcional)
              </label>
              <input
                type="text"
                className="form-control"
                value={consultaForm.co_art}
                onChange={(e) =>
                  setConsultaForm((prev) => ({
                    ...prev,
                    co_art: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="Ej: VEAZAD03"
              />
              <small className="text-muted">
                Deje en blanco para consultar todos los artículos.
              </small>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal para agregar ítem manual */}
      <Modal
        title="Nuevo ítem"
        show={showItemModal}
        onClose={() => {
          if (!saving) {
            setShowItemModal(false);
            setItemForm({ nombre: "", cantidad_meta: 0 });
          }
        }}
        footer={
          <>
            <button
              className="btn btn-outline-secondary"
              onClick={() => setShowItemModal(false)}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreateItem}
              disabled={saving || !selectedListId}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateItem}>
          <div className="mb-3">
            <label className="form-label">Nombre del ítem</label>
            <input
              type="text"
              className="form-control"
              value={itemForm.nombre}
              onChange={(e) =>
                setItemForm((prev) => ({ ...prev, nombre: e.target.value }))
              }
              required
            />
          </div>
          <div className="mb-0">
            <label className="form-label">Cantidad total a cargar</label>
            <input
              type="number"
              className="form-control"
              min="0"
              value={itemForm.cantidad_meta}
              onChange={(e) =>
                setItemForm((prev) => ({
                  ...prev,
                  cantidad_meta: e.target.value,
                }))
              }
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ControlInterno;
