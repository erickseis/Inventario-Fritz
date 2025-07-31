import React, { useEffect, useState } from 'react';
import FormModal from '../components/FormModal';
import { obtenerInventario, obtenerStockMin } from '../service/connection';

const Productos = () => {
 const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [dataProductosAlmacenes, setDataProductosAlmacenes] = useState([])
const [dataStockMinimo, setDataStockMinimo] = useState([])
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

  console.log("data stock min", dataStockMinimo)
  console.log("data productos almacenes", dataProductosAlmacenes)

  // Función helper para obtener stock mínimo desde dataStockMinimo
  const getStockMinimo = (co_art) => {
    const stockMinData = dataStockMinimo.find(item => 
      String(item.co_art).trim() === String(co_art)?.trim()
    );
    return stockMinData ? stockMinData.stock_min : null;
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
    { key: 'co_art', label: 'Código', sortable: true },
    { key: 'art_des', label: 'Descripción', sortable: true },
    { key: 'categoria_principal', label: 'Categoría', sortable: true },
    { key: 'stock_act', label: 'Stock Actual', sortable: true, render: (value) => `${value} un` },
    { key: 'stock_min', label: 'Stock Mínimo', sortable: true, render: (value, producto) => {
      const stockMin = getStockMinimo(producto?.co_art?.trim());
      return stockMin !== null ? stockMin : (value || '0');
    }},
    { key: 'co_alma', label: 'Almacén', sortable: true, render: (value) => {
      if (!value) return 'Sin almacén';
      const cleanValue = String(value).trim();
      const almacen = almacenes.find(a => String(a.co_alma).trim() === cleanValue);
      return almacen ? almacen.nombre : cleanValue;
    }},
  ];

  const formFields = [
    { name: 'art_des', label: 'Descripción', type: 'text', required: true },
    { name: 'categoria_principal', label: 'Categoría', type: 'text', required: true },
    { name: 'stock_act', label: 'Stock Actual', type: 'number', required: true },
    { name: 'stock_minimo', label: 'Stock Mínimo', type: 'number', required: true },
    { name: 'co_alma', label: 'Código Almacén', type: 'text', required: false }
  ];

  const editFormFields = [
    { name: 'co_art', label: 'Código Articulo', type: 'text', required: false },
    { name: 'stock_min', label: 'Stock Mínimo', type: 'number', required: true },
    { name: 'observacion', label: 'Observación', type: 'text', required: false },
    // { name: 'art_des', label: 'Descripción', type: 'text', required: true }
  ];



  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

 

  // Filtrar productos - solo muestra los que coinciden con TODOS los filtros activos
  const filteredProductos = filtrarProductosPorAlmacen().filter(producto => {
    const searchMatch = !searchTerm || 
      producto.art_des.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Pagination
  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProductos.slice(startIndex, endIndex);

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

  const categorias = [...new Set(dataProductosAlmacenes.map(p => p.categoria_principal))].sort();

  if(isLoading || !dataStockMinimo || !dataProductosAlmacenes){
    return (<div class="d-flex justify-content-center">
      <div class="spinner-border" role="status">
      </div>
    </div>)
  }
  
  return (
    <div className="container-fluid py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Gestión de Productos</h1>
    
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Buscar</label>
              <input
                type="text"
                className="form-control"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Categoría</label>
              <select 
                className="form-select"
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
                className="form-select"
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="disponible">Disponible</option>
                <option value="bajo">Stock Bajo</option>
                <option value="sin-stock">Sin Stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>
       {/* Filtros por ubicación */}
       <div className=" row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center card ">
            <div className="card-header">
              <h5 className="card-title mb-0">Filtrar por Ubicación</h5>
            </div>
            <div className="card-body">
              <div className="btn-group" role="group" aria-label="Filtros de ubicación">
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
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Listado de Productos ({filteredProductos.length})</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
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
                          ? column.render(producto[column.key]) 
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
                    <td>
                      <button 
                      title='Cambiar Stock Minimo'
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => handleEdit(producto)}
                      >
                        <i className="bi bi-pencil"></i>
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
    </div>
  );
};

export default Productos;
