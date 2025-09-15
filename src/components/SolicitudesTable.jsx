import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../hooks/useUser';
import { actualizarRequerimiento, obtenerInventario, obtenerVendedores } from '../service/connection';
import Swal from 'sweetalert2';

const SolicitudesTable = ({ data = [], formatearFecha, fetchRequerimientos }) => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const [vendedores,setVendedores]=useState([])
  const [inventario, setInventario]=useState([])
  const [cacheInventario, setCacheInventario] = useState(null)
  const [cacheVendedores, setCacheVendedores] = useState(null)
  const u = Array.isArray(user) ? user[0] : user;
  console.log("user", u);
  const roleValue = u?.rol ?? u?.cargo;
  const numericRole = roleValue != null ? Number(roleValue) : undefined;
  const [formData, setFormData] = useState({
      cantidad_aprobada: '',
      fecha_aprobacion: formatearFecha(new Date()),
      observacion: '',
      estado_aprobacion: '',
      evaluador: '' // Si u es undefined o no tiene id, evaluador será una cadena vacía
  });

const fetchObtenerVendedores=async()=>{
  try {
    setError(null);
    // Check cache first
    if (cacheVendedores) {
      setVendedores(cacheVendedores);
      return;
    }
    
    const dataVendedores= await obtenerVendedores();
    setVendedores(dataVendedores)
    setCacheVendedores(dataVendedores); // Cache the data
    
    // Also store in localStorage for persistence
    localStorage.setItem('vendedores_cache', JSON.stringify(dataVendedores));
    localStorage.setItem('vendedores_cache_time', Date.now().toString());
  } catch (error) {
    console.error('Error loading vendedores:', error);
    setError('Error al cargar datos de vendedores');
    
    // Try to load from localStorage on error
    const cached = localStorage.getItem('vendedores_cache');
    if (cached) {
      setVendedores(JSON.parse(cached));
    }
  }finally{
    setLoading(false)
  }
}
 // Cargar inventario para selector de SKU
  const cargarInventario = async () => {
    try {
      setError(null);
      // Check cache first
      if (cacheInventario) {
        setInventario(cacheInventario);
        return;
      }
      
      const data = await obtenerInventario();
      setInventario(data);
      setCacheInventario(data); // Cache the data
      
      // Also store in localStorage for persistence
      localStorage.setItem('inventario_cache', JSON.stringify(data));
      localStorage.setItem('inventario_cache_time', Date.now().toString());
    } catch (err) {
      console.error('Inventario error:', err);
      setError('Error al cargar datos de inventario');
      
      // Try to load from localStorage on error
      const cached = localStorage.getItem('inventario_cache');
      if (cached) {
        setInventario(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };
useEffect(()=>{
  // Always load fresh data on browser reload, but use cache as immediate display
  const loadFreshData = () => {
    // First, load from cache for immediate display
    const inventarioCached = localStorage.getItem('inventario_cache');
    const vendedoresCached = localStorage.getItem('vendedores_cache');
    
    if (inventarioCached) {
      setInventario(JSON.parse(inventarioCached));
      setCacheInventario(JSON.parse(inventarioCached));
    }
    
    if (vendedoresCached) {
      setVendedores(JSON.parse(vendedoresCached));
      setCacheVendedores(JSON.parse(vendedoresCached));
    }
    
    // Then always fetch fresh data
    cargarInventario();
    fetchObtenerVendedores();
  };
  
  loadFreshData();
  
  // Refresh data every 5 minutes
  const interval = setInterval(() => {
    cargarInventario();
    fetchObtenerVendedores();
  }, 5 * 60 * 1000);
  
  return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
},[])


  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter((s) =>
      String(s.codigo_vendedor).toLowerCase().includes(term) ||
      String(s.sku_producto).toLowerCase().includes(term) ||
      String(s.comentario || '').toLowerCase().includes(term)
    );
  }, [data, search]);
console.log('filtro', filtered)
  // Modal state and handlers
  const [selected, setSelected] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [overrideCantidad, setOverrideCantidad] = useState('');

  const openModal = (solicitud) => {
    setSelected(solicitud);
    setObservacion('');
    setOverrideCantidad(String(solicitud?.cantidad ?? ''));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
    setObservacion('');
    setOverrideCantidad('');
  };

  const handleApprove = async(id) => {
    try {
      const payload = {
        cantidad_aprobada: formData.cantidad_aprobada,
        fecha_aprobacion: formData.fecha_aprobacion,
        observacion: formData.observacion,
        estado_aprobacion: true,
        evaluador: u?.id
      }
      console.log('datos actualizados', payload)
      await actualizarRequerimiento(id, payload)
      fetchObtenerVendedores();
      cargarInventario();
      fetchRequerimientos();
      Swal.fire({
        title:'Datos actualizados',
        text:'Los datos han sido actualizados',
        icon:'success'
      })
      closeModal();
    } catch (error) {
      Swal.fire({
          title:'Error al actualizar los datos',
          text:'revise los campos',
          icon:'error'
      })
      console.error("Error al aprobar la solicitud", error.message)
    }
    
    closeModal();
  };

  const handleReject = async(id) => {
    try {
      const payload = {
        cantidad_aprobada: 0,
        fecha_aprobacion: formData.fecha_aprobacion,
        observacion: formData.observacion,
        estado_aprobacion: false,
        evaluador: u?.id
      }
      console.log('datos actualizados', payload)
      await actualizarRequerimiento(id, payload)
      fetchObtenerVendedores();
      cargarInventario();
      fetchRequerimientos();
      Swal.fire({
        title:'Datos actualizados',
        text:'Los datos han sido actualizados',
        icon:'success'
      })
      closeModal();
    } catch (error) {
      Swal.fire({
          title:'Error al actualizar los datos',
          text:'revise los campos',
          icon:'error'
      })
      console.error("Error al aprobar la solicitud", error.message)
    }
    
    closeModal();
  };

const articulosNombreMap = useMemo(() => {
  if (!Array.isArray(inventario)) return {};
  const map = {};
  for (const a of inventario) {
    const key = (a?.co_art || '').trim().toUpperCase();
    if (key) map[key] = a?.art_des || '';
  }
  return map;
}, [inventario]);

  return (
    <div className="card shadow-sm mt-3">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h6 className="mb-0"> {numericRole === 3 ? 'Mis Solicitudes' : 'Solicitudes de Vendedores'}</h6>
        <div className="input-group" style={{ maxWidth: 300 }}>
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por vendedor, SKU o comentario"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {error && (
        <div className="alert alert-danger m-3 mb-0" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-muted">Cargando datos...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>#</th>
              <th>Vendedor</th>
              <th>SKU</th>
              <th className="text-end">Cantidad</th>
              <th>Fecha</th>
              <th>Estado Aprobación</th>
              <th>Comentario</th>
              {u?.rol != 3 && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-muted py-4">Sin solicitudes</td>
              </tr>
            ) : (
              numericRole === 3 ? filtered.filter((item)=>String(item.codigo_vendedor)=== String(u?.codigo_vendedor)).map((s, idx) => (
                <tr key={s.id ?? idx}>
                  <td>{s.id ?? idx + 1}</td>
                  <td>{`${s.codigo_vendedor} - ${vendedores?.filter(v =>String( v.co_ven) === String(s.codigo_vendedor))?.map((v) => v.ven_des || 'Vendedor no encontrado')}`}</td>
                  <td>{`${s.sku_producto} - ${articulosNombreMap[s.sku_producto] || 'Producto no encontrado'}`}</td>
                  <td className="text-end">{Number(s.cantidad_solicitada)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatearFecha(s.fecha_solicitud)}</td>
                  <td>
                  {s.estado_aprobacion === null?  (
   <span className="badge bg-warning text-dark">Pendiente</span>
) : s.estado_aprobacion === false ? (
  <span className="badge bg-danger">Rechazado</span>
) : (
  <span className="badge bg-success">Aprobado</span>
)}
                  </td>
                  <td style={{ maxWidth: 300 }}>{s.comentario || '-'}</td>
                  {
                    u?.rol != 3 && (
                      <td >
                        {
                            s.estado_aprobacion ? null : (
                              <button className="d-flex justify-content-center align-items-center w-50 h-50 rounded-circle btn btn-primary " onClick={() => openModal(s)}>
                               <i className="bi bi-question-diamond"></i>
                              </button>
                          )
                        }
                      </td>
                    )
                  }
                </tr>
              )) : filtered.map((s, idx) => (
                <tr key={s.id ?? idx}>
                  <td>{s.id ?? idx + 1}</td>
                  <td>{`${s.codigo_vendedor} - ${vendedores?.filter(v =>String( v.co_ven) === String(s.codigo_vendedor))?.map((v) => v.ven_des || 'Vendedor no encontrado')}`}</td>
                  <td>{`${s.sku_producto} - ${articulosNombreMap[s.sku_producto] || 'Producto no encontrado'}`}</td>
                  <td className="text-end">{Number(s.cantidad_solicitada)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatearFecha(s.fecha_solicitud)}</td>
                  <td>
                  {s.estado_aprobacion === null?  (
   <span className="badge bg-warning text-dark">Pendiente</span>
) : s.estado_aprobacion === false ? (
  <span className="badge bg-danger">Rechazado</span>
) : (
  <span className="badge bg-success">Aprobado</span>
)}
                  </td>
                  <td style={{ maxWidth: 300 }}>{s.comentario || '-'}</td>
                  {
                    u?.rol != 3 && (
                      <td >
                        {
                            s.estado_aprobacion ? null : (
                              <button className="d-flex justify-content-center align-items-center w-50 h-50 rounded-circle btn btn-primary " onClick={() => openModal(s)}>
                               <i className="bi bi-question-diamond"></i>
                              </button>
                          )
                        }
                      </td>
                    )
                  }
                </tr>
              )) 
            )}
          </tbody>
        </table>
      </div>
      )}
      {/* Modal */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Detalle de la solicitud</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  {selected && (
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <ul className="list-group list-group-flush">
                          <li className="list-group-item px-0 d-flex justify-content-between"><span className="text-muted">N° Solicitud</span><span className="fw-semibold">{selected.id ?? '-'}</span></li>
                          <li className="list-group-item px-0 d-flex justify-content-between"><span className="text-muted">Vendedor</span><span className="fw-semibold">{`${selected.codigo_vendedor} - ${vendedores?.filter(v =>String( v.co_ven) === String(selected.codigo_vendedor))?.map((v) => v.ven_des || 'Vendedor no encontrado')}`}</span></li>
                          <li className="w-100 list-group-item px-0 d-flex justify-content-between">
                            <span className="text-muted">SKU</span>
                            <span className="d-block fw-semibold" style={{ marginLeft: '3rem', textAlign:'justify' }}>
                              {`${selected.sku_producto} - ${inventario?.filter(i => String(i.co_art) === String(selected.sku_producto))?.map((i) => i.art_des || 'Producto no encontrado')}`}
                            </span>
                          </li>
                          <li className="list-group-item px-0 d-flex justify-content-between"><span className="text-muted">Cantidad solicitada</span><span className="fw-semibold">{Number(selected.cantidad_solicitada)}</span></li>
                        </ul>
                      </div>
                      <div className="col-12 col-md-6">
                        <ul className="list-group list-group-flush">
                          <li className="list-group-item px-0 d-flex justify-content-between"><span className="text-muted">Fecha</span><span className="fw-semibold" style={{ whiteSpace: 'nowrap' }}>{formatearFecha(selected.fecha_solicitud)}</span></li>
                         
                          <li className="list-group-item px-0 d-flex justify-content-between"><span className="text-muted">Estado</span><span>
                            {selected.estado_aprobacion ? (
                              <span className="badge bg-success">Aprobado</span>
                            ) : (
                              <span className="badge bg-warning text-dark">Pendiente</span>
                            )}
                          </span></li>
                        </ul>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Comentario</label>
                        <div className="form-control bg-light" style={{ minHeight: 60 }}>{selected.comentario || '-'}</div>
                      </div>
                      <div className="col-12 col-md-6">
                        <label htmlFor="cantidadAprobada" className="form-label fw-semibold">Cantidad a aprobar</label>
                        <input
                          id="cantidadAprobada"
                          type="number"
                          min={1}
                          className="form-control"
                          value={formData.cantidad_aprobada}
                          onChange={(e) => setFormData({ ...formData, cantidad_aprobada: e.target.value })}
                        />
                        <small className="text-muted">Puedes ajustar la cantidad aprobada diferente a la solicitada.</small>
                      </div>
                   
                      <div className="col-12">
                        <label htmlFor="observacion" className="form-label fw-semibold">Observación</label>
                        <textarea id="observacion" className="form-control" rows={3} placeholder="Agregue una observación (opcional)" value={formData.observacion} onChange={(e) => setFormData({ ...formData, observacion: e.target.value })} />
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
                  <button type="button" className="btn btn-outline-danger" onClick={() => handleReject(selected?.id)}>
                    <i className="bi bi-x-circle me-1"></i> Rechazar
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => handleApprove(selected?.id)}>
                    <i className="bi bi-check2-circle me-1"></i> Aprobar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default SolicitudesTable;
