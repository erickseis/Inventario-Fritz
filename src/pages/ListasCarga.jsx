import React, { useState, useEffect } from 'react';
import { obtenerListasCarga, obtenerDetallesListaCarga, agregarCantidad, restarCantidad, cerrarGuia } from '../service/connection';
import ItemCargaCard from '../components/ItemCargaCard';
import HistoricoModal from '../components/HistoricoModal';
import Swal from 'sweetalert2';

const ListasCarga = () => {
  const [listasCarga, setListasCarga] = useState([]);
  const [listaSeleccionada, setListaSeleccionada] = useState(null);
  const [detallesItems, setDetallesItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    transporte: ''
  });
  const [showHistorico, setShowHistorico] = useState(false);
  const [itemHistorico, setItemHistorico] = useState(null);

  useEffect(() => {
    cargarListasCarga();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarListasCarga = async () => {
    try {
      setLoading(true);
      const response = await obtenerListasCarga(filtros);
      setListasCarga(response || []);
    } catch (error) {
      console.error('Error al cargar listas de carga:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las listas de carga'
      });
    } finally {
      setLoading(false);
    }
  };

  const seleccionarLista = async (lista) => {
    try {
      setLoading(true);
      setListaSeleccionada(lista);
      const response = await obtenerDetallesListaCarga(lista.id);
      setDetallesItems(response || []);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los detalles de la lista'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarCantidad = async (itemId, cantidad) => {
    try {
      await agregarCantidad(listaSeleccionada.id, itemId, cantidad);
      await seleccionarLista(listaSeleccionada);
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Cantidad agregada correctamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo agregar la cantidad'
      });
    }
  };

  const handleRestarCantidad = async (itemId, cantidad) => {
    try {
      await restarCantidad(listaSeleccionada.id, itemId, cantidad);
      await seleccionarLista(listaSeleccionada);
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Cantidad restada correctamente',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo restar la cantidad'
      });
    }
  };

  const handleCerrarGuia = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar guía?',
      text: 'Se cerrará la lista de carga. Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await cerrarGuia(listaSeleccionada.id);
        await cargarListasCarga();
        setListaSeleccionada(null);
        setDetallesItems([]);
        Swal.fire({
          icon: 'success',
          title: '¡Guía cerrada!',
          text: 'La lista de carga ha sido cerrada exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cerrar la guía'
        });
      }
    }
  };

  const handleFiltrar = () => {
    cargarListasCarga();
  };

  const handleVerHistorico = (item) => {
    setItemHistorico(item);
    setShowHistorico(true);
  };

  const todosItemsCompletados = detallesItems.length > 0 && detallesItems.every(item => item.total_cargado >= item.total_a_cargar);

  const calcularProgreso = (lista) => {
    if (!lista.items || lista.items.length === 0) return 0;
    const completados = lista.items.filter(item => item.completado).length;
    return Math.round((completados / lista.items.length) * 100);
  };

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-bold mb-3">
            <i className="bi bi-truck me-2"></i>
            Control de Listas de Carga
          </h2>
          <p className="text-muted">Sistema de digitalización para control de carga de mercancía</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Fecha Desde</label>
              <input
                type="date"
                className="form-control"
                value={filtros.fechaDesde}
                onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Fecha Hasta</label>
              <input
                type="date"
                className="form-control"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Transporte</label>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por transporte..."
                value={filtros.transporte}
                onChange={(e) => setFiltros({ ...filtros, transporte: e.target.value })}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={handleFiltrar}>
                <i className="bi bi-search me-2"></i>Agregar Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Principal */}
      <div className="row">
        {/* Panel Izquierdo - Lista de Cargas */}
        <div className="col-md-4">
          <div className="card shadow-sm" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            <div className="card-header bg-primary text-white d-flex align-items-center">
              <i className="bi bi-list-check me-2"></i>
              <h5 className="mb-0">Listas de Carga</h5>
            </div>
            <div className="card-body p-2">
              {loading && listasCarga.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : listasCarga.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                  <p>No hay listas de carga disponibles</p>
                </div>
              ) : (
                listasCarga.map((lista) => (
                  <div
                    key={lista.id}
                    className={`card mb-2 cursor-pointer ${listaSeleccionada?.id === lista.id ? 'border-primary border-3' : ''}`}
                    onClick={() => seleccionarLista(lista)}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold mb-0 text-primary">
                          <i className="bi bi-truck-front me-2"></i>
                          {lista.transporte}
                        </h6>
                        <span className={`badge ${lista.estado === 'COMPLETADO' ? 'bg-success' : 'bg-warning'}`}>
                          {lista.estado}
                        </span>
                      </div>
                      <small className="text-muted d-block mb-2">
                        <i className="bi bi-calendar3 me-1"></i>
                        {new Date(lista.fecha).toLocaleDateString('es-ES')}
                      </small>
                      <div className="mb-2">
                        <small className="text-muted">
                          {lista.items_completados || 0}/{lista.total_items || 0} items completados
                        </small>
                        <div className="progress mt-1" style={{ height: '6px' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${calcularProgreso(lista)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Panel Derecho - Detalles de la Lista */}
        <div className="col-md-8">
          {listaSeleccionada ? (
            <div className="card shadow-sm">
              <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">
                    <i className="bi bi-truck-front me-2"></i>
                    {listaSeleccionada.transporte}
                  </h5>
                  <small>Fecha: {new Date(listaSeleccionada.fecha).toLocaleDateString('es-ES')}</small>
                </div>
                <button
                  className="btn btn-light btn-sm"
                  onClick={handleCerrarGuia}
                  disabled={!todosItemsCompletados}
                  title={!todosItemsCompletados ? 'Completa todos los items para cerrar la guía' : 'Cerrar guía'}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  Cerrar Guía
                </button>
              </div>
              <div className="card-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
                {loading && detallesItems.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                ) : detallesItems.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-box-seam fs-1 d-block mb-2"></i>
                    <p>No hay items en esta lista</p>
                  </div>
                ) : (
                  detallesItems.map((item) => (
                    <ItemCargaCard
                      key={item.id}
                      item={item}
                      onAgregar={handleAgregarCantidad}
                      onRestar={handleRestarCantidad}
                      onVerHistorico={handleVerHistorico}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-arrow-left-circle fs-1 text-muted d-block mb-3"></i>
                <h5 className="text-muted">Selecciona una lista de carga</h5>
                <p className="text-muted">Elige una lista del panel izquierdo para ver sus detalles</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Histórico */}
      <HistoricoModal
        show={showHistorico}
        onHide={() => setShowHistorico(false)}
        item={itemHistorico}
      />
    </div>
  );
};

export default ListasCarga;
