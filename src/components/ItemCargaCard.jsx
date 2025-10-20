import React, { useState } from 'react';

const ItemCargaCard = ({ item, onAgregar, onRestar, onVerHistorico }) => {
  const [cantidadInput, setCantidadInput] = useState(0);
  const porcentajeCargado = (item.total_cargado / item.total_a_cargar) * 100;
  const completado = item.total_cargado >= item.total_a_cargar;

  const handleAgregar = () => {
    if (cantidadInput > 0) {
      onAgregar(item.id, cantidadInput);
      setCantidadInput(0);
    }
  };

  const handleRestar = () => {
    if (cantidadInput > 0) {
      onRestar(item.id, cantidadInput);
      setCantidadInput(0);
    }
  };

  return (
    <div className={`card mb-3 ${completado ? 'border-success' : 'border-warning'}`}>
      <div className="card-body">
        {/* Header del Item */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="flex-grow-1">
            <h6 className="fw-bold mb-1">{item.nombre_producto}</h6>
            <small className="text-muted">
              <i className="bi bi-box me-1"></i>
              SKU: {item.sku || item.codigo_producto || 'N/A'}
            </small>
          </div>
          <span className={`badge ${completado ? 'bg-success' : 'bg-warning text-dark'}`}>
            {completado ? (
              <>
                <i className="bi bi-check-circle me-1"></i>
                COMPLETO
              </>
            ) : (
              <>
                <i className="bi bi-clock me-1"></i>
                PENDIENTE
              </>
            )}
          </span>
        </div>

        {/* Barra de Progreso */}
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-1">
            <small className="text-muted">Progreso de carga</small>
            <small className="fw-semibold">{porcentajeCargado.toFixed(0)}%</small>
          </div>
          <div className="progress" style={{ height: '10px' }}>
            <div
              className={`progress-bar ${completado ? 'bg-success' : 'bg-warning'}`}
              role="progressbar"
              style={{ width: `${Math.min(porcentajeCargado, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Totales */}
        <div className="row g-2 mb-3">
          <div className="col-6">
            <div className="card bg-light">
              <div className="card-body p-2 text-center">
                <small className="text-muted d-block">Total a Cargar</small>
                <h4 className="mb-0 fw-bold text-primary">{item.total_a_cargar}</h4>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="card bg-light">
              <div className="card-body p-2 text-center">
                <small className="text-muted d-block">Total Cargado</small>
                <h4 className="mb-0 fw-bold text-success">{item.total_cargado}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Controles de Carga */}
        {!completado && (
          <div className="border-top pt-3">
            <div className="row g-2">
              <div className="col-12 col-md-6">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Cantidad"
                  value={cantidadInput || ''}
                  onChange={(e) => setCantidadInput(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                />
              </div>
              <div className="col-6 col-md-3">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleAgregar}
                  disabled={cantidadInput <= 0}
                  title="Agregar cantidad"
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Agregar
                </button>
              </div>
              <div className="col-6 col-md-3">
                <button
                  className="btn btn-danger w-100"
                  onClick={handleRestar}
                  disabled={cantidadInput <= 0 || item.total_cargado === 0}
                  title="Restar cantidad"
                >
                  <i className="bi bi-dash-circle me-1"></i>
                  Restar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botón Ver Histórico */}
        <div className="mt-2">
          <button
            className="btn btn-outline-secondary btn-sm w-100"
            onClick={() => onVerHistorico(item)}
          >
            <i className="bi bi-clock-history me-1"></i>
            Ver Histórico
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemCargaCard;
