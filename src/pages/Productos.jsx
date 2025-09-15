import React, { useContext, useEffect, useMemo, useState } from 'react';
import { obtenerMovimientoSKU } from '../service/connection';
import FormModal from '../components/FormModal';
import { obtenerInventario, obtenerStockMin } from '../service/connection';
import { ModalObservacion } from '../components/ModalObservacion';
import { DataMovimientosContext } from '../hooks/movimientos.context';
import Select from 'react-select';

const Productos = () => {
  const {dataArticulos} = useContext(DataMovimientosContext)
 const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc', or ''
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [dataProductosAlmacenes, setDataProductosAlmacenes] = useState([])
const [dataStockMinimo, setDataStockMinimo] = useState([])
const [showModalObservacion, setShowModalObservacion] = useState(false);
const [observacion, setObservacion] = useState('');
  // meses para promedio
  const [avgMonths, setAvgMonths] = useState(3);
  // mes base (YYYY-MM)
  const [baseMonth, setBaseMonth] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
  });
  // mapa de promedios por SKU (co_art)
  const [avgBySKU, setAvgBySKU] = useState({});
  const [movimientosAll, setMovimientosAll] = useState([]);

const handleShowModalObservacion = () => {
  setShowModalObservacion(!showModalObservacion);
};
  const almacenes = [
    {co_alma: "7020", nombre: "Barquisimeto principal"},
    {co_alma: "8010", nombre: "Maracaibo (Occidente)"},
    {co_alma: "8060", nombre: "Barcelona (Oriente)"},
    {co_alma: "8070", nombre: "Santa Cruz (Estado Aragua Centro)"},
    {co_alma: "8090", nombre: "Prueba Piloto Capital"}
  ]
const fetchStockMinimo = async()=>{
  try {
    const data = await obtenerStockMin()
    setDataStockMinimo(data)
    setIsLoading(false)
  } catch (error) {
    console.error("error al obtener los datos del servidor", error)
  setIsLoading(false)
  }
}
  const fetchDataProductosAlmacenes =async()=>{
    try {
      const data = await obtenerInventario()
     setDataProductosAlmacenes(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error al obtener la data del servidor", error)
      setIsLoading(false)
    }
  }

  useEffect(()=>{
    fetchDataProductosAlmacenes()
    fetchStockMinimo()
  },[]) // Solo al montar el componente

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategoria, selectedEstado, selectedLocation]);


  // Función helper para obtener stock mínimo desde dataStockMinimo
  const getStockMinimo = (co_art) => {
    const stockMinData = dataStockMinimo.find(item => 
      String(item.co_art).trim() === String(co_art)?.trim()
    );
    return stockMinData ? stockMinData.stock_min : null;
  };

  // Función para formatear números con separador de miles
  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '0';
    const num = Math.floor(Number(value));
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Cargar todos los movimientos una sola vez (el backend no filtra por mes)
  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      try {
        const data = await obtenerMovimientoSKU();
        if (!cancelled) setMovimientosAll(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error obteniendo movimientos:', e?.message || e);
        if (!cancelled) setMovimientosAll([]);
      }
    };
    loadAll();
    return () => { cancelled = true; };
  }, []);
  // Cálculo de promedio por SKU basado en total_cajas_vendidas de movimientos filtrados por meses
  useEffect(() => {
    let cancelled = false;
    const fetchMovimientos = async () => {
      try {
        // helpers locales para evitar dependencias faltantes
        const pad2 = (n) => String(n).padStart(2, '0');
        const getMonthsFrom = (yyyyMm, n) => {
          // yyyyMm: 'YYYY-MM'
          const [yStr, mStr] = String(yyyyMm).split('-');
          let year = Number(yStr);
          let monthIdx = Number(mStr) - 1; // 0-11
          const out = [];
          for (let i = 0; i < n; i++) {
            const d = new Date(year, monthIdx - i, 1);
            out.push(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}`);
          }
          return out;
        };

        const meses = getMonthsFrom(baseMonth, Number(avgMonths || 1));
        const mesesSet = new Set(meses);
        // Filtrar del dataset completo solo los meses seleccionados
        const filtrados = Array.isArray(movimientosAll)
          ? movimientosAll.filter((mov) => mov?.mes && mesesSet.has(String(mov.mes)))
          : [];
        // Acumular por co_art
        const acumulado = {};
        filtrados.forEach((mov) => {
          const co = String(mov?.co_art || '').trim();
          if (!co) return;
          const cajas = Number(mov?.total_cajas_vendidas || 0);
          acumulado[co] = (acumulado[co] || 0) + cajas;
        });
        // Calcular promedio simple: total acumulado / meses solicitados
        const promedios = {};
        const divisor = Number(avgMonths || 1);
        Object.keys(acumulado).forEach((co) => {
          promedios[co] = acumulado[co] / divisor;
        });
        if (!cancelled) setAvgBySKU(promedios);
      } catch (e) {
        console.error('Error cargando movimientos para promedio:', e?.message || e);
        if (!cancelled) setAvgBySKU({});
      }
    };
    fetchMovimientos();
    return () => { cancelled = true; };
  }, [avgMonths, baseMonth, movimientosAll]);

  const getPromedioMensual = (producto) => {
    const key = String(producto?.co_art || '').trim();
    if (!key) return null;
    const val = avgBySKU[key];
    return typeof val === 'number' ? val : null;
  };

  const filtrarProductosPorAlmacen = (data = dataProductosAlmacenes) => {
    const codigosAlmacen = selectedLocation === 'all' ?
     almacenes.map(almacen => String(almacen.co_alma).trim())
     :
     [String(selectedLocation).trim()];
    return data.filter(item => {
      const itemAlmacen = item.co_alma ? String(item.co_alma).trim() : '';
      return codigosAlmacen.includes(itemAlmacen);
    });
  } 
  const columns = [
    { key: 'co_art', label: 'Código', sortable: true, render: (value) => (
      <span className="badge bg-light text-dark border">{String(value)}</span>
    )},
    { key: 'art_des', label: 'Descripción', sortable: true, render: (value) => (
      <span className="fw-semibold">{value}</span>
    )},
    { key: 'categoria_principal', label: 'Categoría', sortable: true, render: (value) => (
      <span className="badge bg-secondary">{value || '—'}</span>
    )},
    { key: 'stock_disponible', label: 'Stock Disponible', sortable: true, render: (value, producto) => {
      const disponible = Number(producto.stock_act || 0) - Number(producto.stock_com || 0);
      return `${formatNumber(disponible)} un`;
    }},
    { key: 'stock_min', label: 'Stock Mínimo', sortable: true, render: (value, producto) => {
      const stockMin = getStockMinimo(producto?.co_art?.trim());
      return stockMin !== null ? formatNumber(stockMin) : formatNumber(value || '0');
    }},
    { key: 'co_alma', label: 'Almacén', sortable: true, render: (value) => {
      if (!value) return 'Sin almacén';
      const cleanValue = String(value).trim();
      const almacen = almacenes.find(a => String(a.co_alma).trim() === cleanValue);
      return (
        <span className="badge bg-info-subtle text-dark border">
          {almacen ? almacen.nombre : cleanValue}
        </span>
      );
    }},{ key: 'promedio', label: 'Promedio Movimiento', sortable: true, render: (value, producto) => {
      const promedio = getPromedioMensual(producto);
      if (promedio === null) return 'Sin datos';
      return (
        <span className="badge bg-info-subtle text-dark border">
          {formatNumber(promedio)} un/mes
        </span>
      );
    }}
  ];

  const formFields = [
    { name: 'art_des', label: 'Descripción', type: 'text', required: true },
    { name: 'categoria_principal', label: 'Categoría', type: 'text', required: true },
    { name: 'stock_act', label: 'Stock Actual', type: 'number', required: true },
    { name: 'stock_minimo', label: 'Stock Mínimo', type: 'number', required: true },
    { name: 'co_alma', label: 'Código Almacén', type: 'text', required: false }
  ];

  const editFormFields = [
    { name: 'co_art', label: 'Código Articulo', type: 'text', required: false, disabled: true },
    { name: 'stock_min', label: 'Stock Mínimo', type: 'number', required: true },
    { name: 'observacion', label: 'Observación', type: 'text', required: false },
  ];



  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

 

  // Filtrar productos - solo muestra los que coinciden con TODOS los filtros activos
  const filteredProductos = filtrarProductosPorAlmacen().filter(producto => {
    const searchMatch = !searchTerm || 
      producto.art_des.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.co_art.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.categoria_principal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.des_sub?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const categoriaMatch = !selectedCategoria || producto.categoria_principal === selectedCategoria;
    
    const stockDisponible = (producto.stock_act || 0) - (producto.stock_com || 0);
    
    // Determinar estado actual del producto usando stock_min de dataStockMinimo
    const stockMinimoReal = getStockMinimo(producto?.co_art) || producto.stock_minimo || 0;
    let estadoProducto = '';
    if (stockDisponible === 0) {
      estadoProducto = 'sin-stock';
    } else if (stockMinimoReal > 0 && stockDisponible <= stockMinimoReal) {
      estadoProducto = 'bajo';
    } else if (stockDisponible > 0) {
      estadoProducto = 'disponible';
    }
    
    // Solo mostrar productos que coincidan con el estado seleccionado
    const estadoMatch = !selectedEstado || estadoProducto === selectedEstado;
    
    return searchMatch && categoriaMatch && estadoMatch;
  });

  // Ordenar productos por stock disponible (stock_act - stock_com)
  const sortedProductos = [...filteredProductos].sort((a, b) => {
    const stockDisponibleA = Number(a.stock_act || 0) - Number(a.stock_com || 0);
    const stockDisponibleB = Number(b.stock_act || 0) - Number(b.stock_com || 0);
    
    if (sortOrder === 'asc') {
      return stockDisponibleA - stockDisponibleB;
    } else if (sortOrder === 'desc') {
      return stockDisponibleB - stockDisponibleA;
    }
    return 0; // Sin ordenamiento
  });

  const toggleSortOrder = () => {
    setSortOrder(prev => {
      if (prev === '') return 'asc';
      if (prev === 'asc') return 'desc';
      return ''; // Volver a sin ordenamiento
    });
  };

  // Pagination
  const totalPages = Math.ceil(sortedProductos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sortedProductos.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const articulosMap = useMemo(() => {
    if (!dataArticulos) return {};
    return dataArticulos.reduce((map, articulo) => {
      map[articulo.co_art.trim()] = articulo.art_des;
      return map;
    }, {});
  }, [dataArticulos]);

  const options = Object.keys(articulosMap || {}).map((co) => ({
    value: co,
    label: `${co} - ${articulosMap[co]}`,
  }));
  const categorias = [...new Set(dataProductosAlmacenes.map(p => p.categoria_principal))].sort();

  if(isLoading || !dataProductosAlmacenes || dataProductosAlmacenes.length === 0){
    return (<div className="d-flex justify-content-center">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>)
  }
  
  return (
    <div className="container py-3">
      <div className="card border-0 shadow-sm overflow-hidden mb-3">
        <div className="p-4 d-flex align-items-center justify-content-between" style={{background: 'linear-gradient(90deg, #6f42c1 0%, #b794f6 100%)'}}>
          <div className="d-flex align-items-center gap-2 text-white">
            <i className="bi bi-grid-3x3-gap"></i>
            <h5 className="mb-0">Productos</h5>
          </div>
          <small className="text-white-75">Consulta, filtra y gestiona el stock</small>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-white d-flex align-items-center gap-2">
          <i className="bi bi-funnel text-primary"></i>
          <h6 className="mb-0">Filtros</h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Buscar</label>
              <div className="input-group" style={{zIndex:'1000'}}>
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <Select
                  className="form-control"
                    options={options}
                    isClearable
                    isSearchable
                    placeholder="Seleccione"
                    onChange={(opt) =>
                      setSearchTerm(opt?.value || "")
                    }
                  />
          
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label">Categoría</label>
              <select 
                className="form-control form-select"
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Estado</label>
              <select 
                className="form-control form-select"
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="disponible">Disponible</option>
                <option value="bajo">Stock Bajo</option>
                <option value="sin-stock">Sin Stock</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Promedio Movimiento (meses)</label>
              <select
                className="form-control form-select"
                value={avgMonths}
                onChange={(e) => setAvgMonths(Number(e.target.value))}
              >
                <option value={1}>Último 1 mes</option>
                <option value={2}>Últimos 2 meses</option>
                <option value={3}>Últimos 3 meses</option>
                <option value={6}>Últimos 6 meses</option>
                <option value={12}>Últimos 12 meses</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Mes base</label>
              <input
                type="month"
                className="form-control"
                value={baseMonth}
                onChange={(e) => setBaseMonth(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Ordenar por Stock</label>
              <button 
                type="button"
                className="btn btn-outline-primary w-100 p-2"
                onClick={toggleSortOrder}
                style={{height:'3rem'}}
              >
                {sortOrder === '' ? 'Sin ordenar' : 
                 sortOrder === 'asc' ? 'Menor a Mayor ' : 'Mayor a Menor '}
              </button>
            </div>
          </div>
          <div className="mt-3">
            <div className="d-flex align-items-center mb-2 gap-2">
              <i className="bi bi-geo-alt text-danger"></i>
              <span className="fw-semibold">Ubicación</span>
            </div>
            <div className=" d-flex  btn-group flex-wrap" role="group" aria-label="Filtros de ubicación">
              <button type="button" className={`btn btn-outline-primary ${selectedLocation === 'all' ? 'active' : ''}`} onClick={() => setSelectedLocation('all')}>
                Todos
              </button>
              <button type="button" className={`btn btn-outline-primary ${selectedLocation === '7020' ? 'active' : ''}`} onClick={() => setSelectedLocation('7020')}>
                Barquisimeto Principal 
              </button>
              <button type="button" className={`btn btn-outline-primary ${selectedLocation === '8010' ? 'active' : ''}`} onClick={() => setSelectedLocation('8010')}>
                Maracaibo Occidente
              </button>
              <button type="button" className={`btn btn-outline-primary ${selectedLocation === '8060' ? 'active' : ''}`} onClick={() => setSelectedLocation('8060')}>
                Barcelona Oriente
              </button>
              <button type="button" className={`btn btn-outline-primary ${selectedLocation === '8070' ? 'active' : ''}`} onClick={() => setSelectedLocation('8070')}>
                Santa Cruz Aragua 
              </button>
              <button type="button" className={`btn btn-outline-primary ${selectedLocation === '8090' ? 'active' : ''}`} onClick={() => setSelectedLocation('8090')}>
                Capital 
              </button>
            </div>
          </div>
        </div>
      </div>
  
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProductos.length)} de {filteredProductos.length} productos
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={handlePreviousPage} disabled={currentPage === 1}>
                  Anterior
                </button>
              </li>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                if (pageNum < 1 || pageNum > totalPages) return null;
                
                return (
                  <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(pageNum)}>
                      {pageNum}
                    </button>
                  </li>
                );
              })}
              
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={handleNextPage} disabled={currentPage === totalPages}>
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
      {/* Tabla de productos */}
      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0 d-flex align-items-center gap-2"><i className="bi bi-boxes"></i>Listado de Productos</h6>
          <small className="text-muted">Total filtrados: {filteredProductos.length}</small>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm table-striped table-hover align-middle mb-0">
              <thead style={{position:'sticky', top:0, zIndex:1}} className="bg-light">
                <tr>
                  {columns.map(column => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                  
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((producto) => (
                  <tr key={`${producto.co_art}-${producto.co_alma || 'all'}`}>
                  {columns.map(column => (
                      <td key={column.key}>
                        {column.render 
                          ? column.render(producto[column.key], producto) 
                          : producto[column.key]}
                      </td>
                    ))}
                    <td>
                      {(() => {
                        const stockDisponible = (producto.stock_act || 0) - (producto.stock_com || 0);
                        const stockMinimoReal = getStockMinimo(producto.co_art) || producto.stock_minimo || 0;
                        return (
                          <span className={`badge ${
                            stockDisponible === 0  ? 'bg-danger' : 
                            stockMinimoReal > 0 && stockDisponible <= stockMinimoReal ? 'bg-warning' : 
                            'bg-success'
                          }`}>
                            {stockDisponible === 0 ? 'Sin Stock' : 
                             stockMinimoReal > 0 && stockDisponible <= stockMinimoReal ? 'Stock Bajo' : 
                             'Disponible'}
                          </span>
                        );
                      })()}
                    </td>
                    <td className='d-flex flex-row'>
                      <button 
                      title='Cambiar Stock Minimo'
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => handleEdit(producto)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button 
                      title='Ver Observaciones'
                        className="btn btn-sm btn-outline-secondary me-1"
                        onClick={() => {
                          const match = dataStockMinimo.find(item => item.co_art === producto.co_art);
                          if (match) {
                            setObservacion(match);
                          } else {
                            setObservacion(producto);
                          }
                          handleShowModalObservacion();
                        }}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                     
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {currentProducts.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted">No se encontraron productos con los filtros aplicados</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProductos.length)} de {filteredProductos.length} productos
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={handlePreviousPage} disabled={currentPage === 1}>
                  Anterior
                </button>
              </li>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                if (pageNum < 1 || pageNum > totalPages) return null;
                
                return (
                  <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(pageNum)}>
                      {pageNum}
                    </button>
                  </li>
                );
              })}
              
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={handleNextPage} disabled={currentPage === totalPages}>
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      <FormModal
      fetchStockMinimo={fetchStockMinimo}
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? `Editar Producto: ${editingItem.art_des}` : 'Nuevo Producto'}
        fields={editingItem ? editFormFields : formFields}
        initialData={editingItem}
      />
      <ModalObservacion 
      show={showModalObservacion}
      onClose={handleShowModalObservacion} 
      data={observacion}
      />
    </div>
  );
};

export default Productos;
