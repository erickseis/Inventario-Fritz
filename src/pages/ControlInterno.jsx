import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ajustarItemControl,
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

const demoLists = [
  {
    id: 1,
    nombre: "Transporte ABC-123",
    referencia: "Guía 2025-10-15",
    fecha: "2025-10-15",
    total_meta: 400,
    total_cargada: 0,
    total_items: 3,
    items_completados: 0,
    items: [
      {
        id: 11,
        nombre: "Cajas de Electrónicos",
        cantidad_meta: 200,
        cantidad_cargada: 0,
      },
      {
        id: 12,
        nombre: "Paquetes de Ropa",
        cantidad_meta: 150,
        cantidad_cargada: 0,
      },
      {
        id: 13,
        nombre: "Muebles de Oficina",
        cantidad_meta: 50,
        cantidad_cargada: 0,
      },
    ],
  },
  {
    id: 2,
    nombre: "Transporte XYZ-789",
    referencia: "Guía 2025-10-16",
    fecha: "2025-10-16",
    total_meta: 260,
    total_cargada: 60,
    total_items: 3,
    items_completados: 0,
    items: [
      {
        id: 21,
        nombre: "Contenedores Plásticos",
        cantidad_meta: 80,
        cantidad_cargada: 20,
      },
      {
        id: 22,
        nombre: "Manual de Usuario",
        cantidad_meta: 120,
        cantidad_cargada: 40,
      },
      {
        id: 23,
        nombre: "Pallets de Exhibición",
        cantidad_meta: 60,
        cantidad_cargada: 0,
      },
    ],
  },
];

const defaultListForm = () => ({
  nombre: "",
  fecha: new Date().toISOString().slice(0, 10),
  referencia: "",
});

const defaultItemForm = () => ({
  nombre: "",
  cantidad_meta: 0,
});

const Modal = ({ title, show, onClose, footer, children }) => {
  if (!show) return null;
  return (
    <div
      className="modal-backdrop fade show"
      style={{ display: "block", backgroundColor: "rgba(0, 0, 0)" }}
    >
      <div className="modal d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
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
              ></button>
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
  const [demoMode, setDemoMode] = useState(false);
  const [lists, setLists] = useState([]);
  const [selectedListId, setSelectedListId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [inputValues, setInputValues] = useState({});
  const [historyMap, setHistoryMap] = useState({});
  const [historyLoading, setHistoryLoading] = useState({});
  const [demoHistory, setDemoHistory] = useState({}); // Historial simulado para demo

  const [showListModal, setShowListModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [listForm, setListForm] = useState(defaultListForm);
  const [itemForm, setItemForm] = useState(defaultItemForm());
  const [saving, setSaving] = useState(false);
  const [nextDemoId, setNextDemoId] = useState(100); // Para generar IDs únicos en demo

  const fetchLists = useCallback(
    async (listIdToSelect = null) => {
      if (demoMode) {
        // Usar las listas actuales del estado si ya hay modificaciones, o las demo iniciales
        setLists((prev) => {
          const currentLists = prev.length === 0 ? demoLists : prev;
          if (listIdToSelect) {
            setSelectedListId(listIdToSelect);
          } else if (
            !selectedListId ||
            !currentLists.some((l) => l.id === selectedListId)
          ) {
            setSelectedListId(currentLists[0]?.id ?? demoLists[0]?.id ?? null);
          }
          return currentLists;
        });
        setLoading(false);
        setError(null);
        return;
      }

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
    [demoMode, selectedListId],
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
      numeric === "" ? "" : Math.min(999999, parseInt(numeric, 10));
    setInputValues((prev) => ({
      ...prev,
      [itemId]: clamped === "" ? "" : String(clamped),
    }));
  };

  const handleAdjust = async (itemId, action) => {
    if (demoMode) {
      const quantity = Math.max(1, Number(inputValues[itemId] ?? 1));
      setLists((prevLists) =>
        prevLists.map((list) => {
          if (list.id !== selectedListId) return list;
          return {
            ...list,
            items: list.items.map((item) => {
              if (item.id !== itemId) return item;
              const delta = action === "add" ? quantity : -quantity;
              const nuevaCantidad = Math.max(
                0,
                Math.min(item.cantidad_meta, item.cantidad_cargada + delta),
              );
              const updatedItem = { ...item, cantidad_cargada: nuevaCantidad };

              // Actualizar historial demo
              setDemoHistory((prev) => {
                const itemHistory = prev[itemId] || [];
                return {
                  ...prev,
                  [itemId]: [
                    ...itemHistory,
                    {
                      id: Date.now(),
                      tipo: action,
                      cantidad: quantity,
                      fecha_evento: new Date().toISOString(),
                    },
                  ],
                };
              });

              return updatedItem;
            }),
          };
        }),
      );
      setInputValues((prev) => ({ ...prev, [itemId]: "1" }));
      setHistoryMap((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      return;
    }
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

    if (demoMode) {
      setLists((prevLists) =>
        prevLists.map((list) => {
          if (list.id !== selectedListId) return list;
          return {
            ...list,
            items: list.items.map((item) => {
              if (item.id !== itemId) return item;
              const cantidadReset = item.cantidad_cargada;

              // Actualizar historial demo
              if (cantidadReset > 0) {
                setDemoHistory((prev) => {
                  const itemHistory = prev[itemId] || [];
                  return {
                    ...prev,
                    [itemId]: [
                      ...itemHistory,
                      {
                        id: Date.now(),
                        tipo: "reset",
                        cantidad: cantidadReset,
                        fecha_evento: new Date().toISOString(),
                      },
                    ],
                  };
                });
              }

              return { ...item, cantidad_cargada: 0 };
            }),
          };
        }),
      );
      setHistoryMap((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
      return;
    }

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
    if (demoMode) {
      setHistoryLoading((prev) => ({ ...prev, [itemId]: true }));
      // Simular carga
      setTimeout(() => {
        const history = demoHistory[itemId] || [];
        setHistoryMap((prev) => ({ ...prev, [itemId]: history }));
        setHistoryLoading((prev) => ({ ...prev, [itemId]: false }));
      }, 300);
      return;
    }
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

  const handleCreateList = async (e) => {
    e.preventDefault();
    const payload = {
      nombre: listForm.nombre.trim(),
      fecha: listForm.fecha,
      referencia: listForm.referencia.trim() || null,
    };
    if (!payload.nombre) {
      alert("El nombre es obligatorio.");
      return;
    }

    if (demoMode) {
      const newList = {
        id: nextDemoId,
        nombre: payload.nombre,
        referencia: payload.referencia || "",
        fecha: payload.fecha,
        total_meta: 0,
        total_cargada: 0,
        total_items: 0,
        items_completados: 0,
        items: [],
      };
      setNextDemoId((prev) => prev + 1);
      setLists((prev) => [...prev, newList]);
      setShowListModal(false);
      setListForm(defaultListForm());
      setSelectedListId(newList.id);
      return;
    }

    setSaving(true);
    try {
      const newList = await crearListaControl(payload);
      setShowListModal(false);
      setListForm(defaultListForm());
      await fetchLists(newList.id);
    } catch (err) {
      console.error(err);
      alert("No se pudo crear la lista.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!selectedListId) return;

    const payload = {
      nombre: itemForm.nombre.trim(),
      cantidad_meta: Math.max(0, parseInt(itemForm.cantidad_meta, 10) || 0),
    };
    if (!payload.nombre) {
      alert("El nombre del ítem es obligatorio.");
      return;
    }

    if (demoMode) {
      const newItem = {
        id: nextDemoId,
        nombre: payload.nombre,
        cantidad_meta: payload.cantidad_meta,
        cantidad_cargada: 0,
      };
      setNextDemoId((prev) => prev + 1);
      setLists((prev) =>
        prev.map((list) => {
          if (list.id !== selectedListId) return list;
          return {
            ...list,
            items: [...list.items, newItem],
            total_meta: list.total_meta + payload.cantidad_meta,
            total_items: list.items.length + 1,
          };
        }),
      );
      setShowItemModal(false);
      setItemForm(defaultItemForm());
      return;
    }

    setSaving(true);
    try {
      await crearItemControl(selectedListId, payload);
      setShowItemModal(false);
      setItemForm(defaultItemForm());
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
      <div className="d-flex flex-column flex-lg-row gap-3">
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
              className="card-header d-flex justify-content-between align-items-center text-white"
              style={{
                background: "linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)",
              }}
            >
              <span className="fw-semibold">Listas de Carga</span>
              <div className="d-flex gap-2">
                <button
                  className={`btn btn-sm fw-semibold ${demoMode ? "btn-warning" : "btn-outline-light"}`}
                  onClick={() => {
                    const newDemoMode = !demoMode;
                    setDemoMode(newDemoMode);
                    setHistoryMap({});
                    setHistoryLoading({});
                    setInputValues({});
                    setDemoHistory({});
                    if (newDemoMode) {
                      // Al activar demo, inicializar con las listas demo
                      setLists(demoLists);
                      setSelectedListId(demoLists[0]?.id ?? null);
                      setNextDemoId(100);
                    }
                  }}
                >
                  {demoMode ? "Modo Demo" : "Usar Demo"}
                </button>
                <button
                  className="btn btn-sm btn-light fw-semibold"
                  onClick={() => {
                    setShowListModal(true);
                  }}
                >
                  Agregar
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="p-3 text-center text-muted">Cargando...</div>
              ) : error ? (
                <div className="p-3 text-center text-danger">{error}</div>
              ) : lists.length === 0 ? (
                <div className="p-3 text-center text-muted">
                  Aún no hay listas. Crea la primera para comenzar.
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

        <div className="flex-grow-1">
          {!selectedList ? (
            <div className="alert alert-info shadow-sm">
              Selecciona una lista de carga o crea una nueva para comenzar.
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
                  <i className="bi bi-plus-circle me-1"></i>
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
                    <i className="bi bi-archive fs-1 d-block mb-2"></i>
                    Aún no hay ítems en esta lista. Utiliza “Agregar ítem” para
                    comenzar.
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
                                  Meta:{" "}
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
                                    <i className="bi bi-plus-lg me-1"></i>
                                    Agregar
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger fw-semibold"
                                    onClick={() =>
                                      handleAdjust(item.id, "subtract")
                                    }
                                  >
                                    <i className="bi bi-dash-lg me-1"></i>Restar
                                  </button>
                                </div>
                                <button
                                  className="btn btn-sm btn-outline-secondary fw-semibold"
                                  onClick={() => toggleHistory(item.id)}
                                >
                                  <i className="bi bi-clock-history me-1"></i>
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

      <Modal
        title="Nueva lista de carga"
        show={showListModal}
        onClose={() => {
          if (!saving) {
            setShowListModal(false);
            setListForm(defaultListForm());
          }
        }}
        footer={
          <>
            <button
              className="btn btn-outline-secondary"
              onClick={() => setShowListModal(false)}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCreateList}
              disabled={saving}
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateList}>
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              value={listForm.nombre}
              onChange={(e) =>
                setListForm((prev) => ({ ...prev, nombre: e.target.value }))
              }
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Fecha</label>
            <input
              type="date"
              className="form-control"
              value={listForm.fecha}
              onChange={(e) =>
                setListForm((prev) => ({ ...prev, fecha: e.target.value }))
              }
              required
            />
          </div>
          <div className="mb-0">
            <label className="form-label">Referencia / Nota</label>
            <textarea
              className="form-control"
              value={listForm.referencia}
              onChange={(e) =>
                setListForm((prev) => ({ ...prev, referencia: e.target.value }))
              }
              rows={2}
            />
          </div>
        </form>
      </Modal>

      <Modal
        title="Nuevo ítem"
        show={showItemModal}
        onClose={() => {
          if (!saving) {
            setShowItemModal(false);
            setItemForm(defaultItemForm());
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
