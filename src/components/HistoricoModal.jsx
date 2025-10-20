import React from 'react';

const HistoricoModal = ({ show, onHide, item }) => {
  if (!item) return null;

  const historico = item.historico || [];
  
  // Calcular el total acumulado
  const totalAcumulado = historico.reduce((acc, h) => acc + (h.cantidad || 0), 0);

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show" 
        onClick={onHide}
        style={{ zIndex: 1040 }}
      ></div>
      
      {/* Modal */}
      <div 
        className="modal fade show d-block" 
        tabIndex="-1" 
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                <i className="bi bi-clock-history me-2"></i>
                Histórico de Carga
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onHide}
                aria-label="Close"
              ></button>
            </div>
            
            {/* Body */}
            <div className="modal-body">
              {/* Información del Item */}
              <div className="card bg-light mb-3">
                <div className="card-body">
                  <h5 className="fw-bold mb-2">{item.nombre_producto}</h5>
                  <div className="row">
                    <div className="col-6">
                      <small className="text-muted d-block">Código/SKU</small>
                      <span className="fw-semibold">{item.sku || item.codigo_producto || 'N/A'}</span>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Total a Cargar</small>
                      <span className="fw-semibold">{item.total_a_cargar}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Movimientos */}
              <h6 className="fw-bold mb-3">Movimientos de Carga</h6>
              {historico.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                  <p>No hay movimientos registrados para este item</p>
                </div>
              ) : (
                <>
                  <div className="list-group mb-3">
                    {historico.map((h, index) => (
                      <div key={index} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="d-flex align-items-center mb-1">
                              <span className={`badge ${h.tipo === 'AGREGAR' ? 'bg-success' : 'bg-danger'} me-2`}>
                                {h.tipo === 'AGREGAR' ? (
                                  <i className="bi bi-plus-circle me-1"></i>
                                ) : (
                                  <i className="bi bi-dash-circle me-1"></i>
                                )}
                                {h.tipo}
                              </span>
                              <span className="fw-bold fs-5">
                                {h.tipo === 'AGREGAR' ? '+' : '-'}{h.cantidad}
                              </span>
                            </div>
                            <small className="text-muted">
                              <i className="bi bi-calendar3 me-1"></i>
                              {new Date(h.fecha).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </small>
                            {h.usuario && (
                              <small className="text-muted d-block">
                                <i className="bi bi-person me-1"></i>
                                {h.usuario}
                              </small>
                            )}
                          </div>
                          <div className="text-end">
                            <small className="text-muted d-block">Acumulado</small>
                            <span className="fw-bold text-primary">{h.acumulado}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Resumen */}
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <div className="row text-center">
                        <div className="col-4">
                          <small>Total Movimientos</small>
                          <h4 className="mb-0 fw-bold">{historico.length}</h4>
                        </div>
                        <div className="col-4">
                          <small>Total Cargado</small>
                          <h4 className="mb-0 fw-bold">{item.total_cargado}</h4>
                        </div>
                        <div className="col-4">
                          <small>Progreso</small>
                          <h4 className="mb-0 fw-bold">
                            {((item.total_cargado / item.total_a_cargar) * 100).toFixed(0)}%
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fórmula de Ejemplo */}
                  {historico.length > 0 && (
                    <div className="alert alert-info mt-3 mb-0">
                      <small className="fw-semibold">
                        <i className="bi bi-calculator me-1"></i>
                        Ejemplo: {historico.map(h => h.cantidad).join(' + ')} = {totalAcumulado}
                      </small>
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Footer */}
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onHide}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoricoModal;
