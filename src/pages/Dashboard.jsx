import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import MetricCard from '../components/MetricCard';
import SalesChart from '../components/SalesChart';
import ProductionChart from '../components/ProductionChart';
import { obtenerInventario, obtenerStockMin } from '../service/connection';
import { useUser } from '../hooks/useUser';


const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  // Redirect role 3 users to inventario
  useEffect(() => {
    if (user) {
      const u = Array.isArray(user) ? user[0] : user;
      const roleValue = u?.rol ?? u?.cargo;
      const numericRole = roleValue != null ? Number(roleValue) : undefined;
      
      if (numericRole === 3) {
        navigate('/inventario', { replace: true });
      }
    }
  }, [user, navigate]);

  const [isLoading, setIsLoading] = useState(true);
  const { data: productos } = useData('productos');
  const { data: ventas } = useData('ventas');
  const { data: produccion } = useData('produccion');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // revision de logica
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [filteredVentas, setFilteredVentas] = useState([]);
  const [filteredProduccion, setFilteredProduccion] = useState([]);
// data inventario
const [dataInventario, setDataInventario] = useState([]);
const [dataStockMinimo, setDataStockMinimo] = useState([]);

const fetchDataInventario = async () => {
  try {
    const data = await obtenerInventario();
    setDataInventario(data);
    setIsLoading(false);
  } catch (error) {
    console.error("Error al obtener la data del servidor", error);
    setIsLoading(false);
  }
};

const fetchStockMinimo = async () => {
  try {
    const data = await obtenerStockMin();
    setDataStockMinimo(data);
  } catch (error) {
    console.error("Error al obtener stock mínimo", error);
  }
};

useEffect(() => {
  fetchDataInventario();
  fetchStockMinimo();
}, [])
const almacenes = [
  {co_alma: "7020", nombre: "Barquisimeto principal"},
  {co_alma: "8010", nombre: "Maracaibo (Occidente)"},
  {co_alma: "8060", nombre: "Barcelona (Oriente)"},
  {co_alma: "8070", nombre: "Santa Cruz (Estado Aragua Centro)"},
  {co_alma: "8090", nombre: "Prueba Piloto Capital"}
]
// Función helper para obtener stock mínimo desde dataStockMinimo
const getStockMinimo = (co_art) => {
  const stockMinData = dataStockMinimo.find(item => 
    String(item.co_art).trim() === String(co_art)?.trim()
  );
  return stockMinData ? stockMinData.stock_min : null;
};
// Función para filtrar productos por almacenes específicos
const filtrarProductosPorAlmacen = (data = dataInventario) => {
  const codigosAlmacen = selectedLocation === 'all' ?
   almacenes.map(almacen => almacen.co_alma)
   :
   selectedLocation;
  return data.filter(item => 
    codigosAlmacen.includes(item.co_alma?.trim())
  );
}
// Obtener productos filtrados
const cantidadTotaldeProductos = filtrarProductosPorAlmacen().length;

const stockTotaldeProductosDisponible = filtrarProductosPorAlmacen().filter(producto => {
  const stockDisponible = (producto.stock_act || 0) - (producto.stock_com || 0);
  return stockDisponible > 0;
}).length;

// configurar stock minimo para obtener el stock bajo
const stockTotaldeProductosBajo = filtrarProductosPorAlmacen().filter(producto => {
  const stockDisponible = (producto.stock_act || 0) - (producto.stock_com || 0);
  const stockMinimoReal = getStockMinimo(producto?.co_art) || 0;
  return stockDisponible > 0 && stockDisponible <= stockMinimoReal;
}).length;

const sinStockDeProductos = filtrarProductosPorAlmacen().filter(producto => {
  const stockDisponible = (producto.stock_act || 0) - (producto.stock_com || 0);
  return stockDisponible === 0;
}).length;



  // Filtrar datos por ubicación
  useEffect(() => {
    if (selectedLocation === 'all') {
      setFilteredProductos(productos);
      setFilteredVentas(ventas);
      setFilteredProduccion(produccion);
    } else {
      setFilteredProductos(productos.filter(p => p.ubicacion === selectedLocation));
      setFilteredVentas(ventas.filter(v => v.ubicacion === selectedLocation));
      setFilteredProduccion(produccion.filter(p => p.ubicacion === selectedLocation));
    }
  }, [selectedLocation, productos, ventas, produccion]);


  // Productos próximos a vencer (usando productos reales con fechas simuladas)
  const productosConVencimiento = filteredProductos.map(producto => {
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + Math.floor(Math.random() * 60) - 30);
    const diasParaVencer = Math.ceil((fechaVencimiento - new Date()) / (1000 * 60 * 60 * 24));
    
    return {
      ...producto,
      fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
      dias_para_vencer: diasParaVencer,
      estado: diasParaVencer <= 0 ? 'Vencido' : 'Vence Pronto'
    };
  }).filter(p => p.estado !== 'Vigente' && p.dias_para_vencer <= 7)
    .sort((a, b) => a.dias_para_vencer - b.dias_para_vencer)
    .slice(0, 5);

if( isLoading){
  return (
    <div className="d-flex justify-content-center align-items-center" style={{minHeight:'60vh'}}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  )
}

  return (
    <div className="container py-3">
      <div className="card border-0 shadow-sm overflow-hidden mb-3">
        <div className="p-4 d-flex align-items-center justify-content-between" style={{background: 'linear-gradient(90deg, #0d6efd 0%, #6ea8fe 100%)'}}>
          <div className="d-flex align-items-center gap-2 text-white">
            <i className="bi bi-speedometer2"></i>
            <h5 className="mb-0">Dashboard</h5>
          </div>
          <small className="text-white-75">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </small>
        </div>
      </div>

   


      {/* Filtros por ubicación */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex align-items-center gap-2">
              <i className="bi bi-geo-alt text-danger"></i>
              <h6 className="mb-0">Filtrar por Ubicación</h6>
            </div>
            <div className="card-body">
              <div className="btn-group flex-wrap" role="group" aria-label="Filtros de ubicación">
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
   {/* Tarjetas de métricas */}
   <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <MetricCard 
            title="Total Productos" 
            value={cantidadTotaldeProductos} 
            icon="📦" 
            color="primary"
          />
        </div>
        <div className="col-md-3 mb-3">
          <MetricCard 
            title="Stock Disponible" 
            value={stockTotaldeProductosDisponible} 
            icon="✅" 
            color="success"
          />
        </div>
        <div className="col-md-3 mb-3">
          <MetricCard 
            title="Stock Bajo" 
            value={stockTotaldeProductosBajo} 
            icon="⚠️" 
            color="warning"
          />
        </div>
        <div className="col-md-3 mb-3">
          <MetricCard 
            title="Sin Stock" 
            value={sinStockDeProductos} 
            icon="❌" 
            color="danger"
          />
        </div>
      </div>
      {/* Tabla de actividad reciente */}
      <div className="row">
        <div className="col-lg-8 col-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex align-items-center gap-2">
              <i className="bi bi-activity text-primary"></i>
              <h6 className="mb-0">Actividad Reciente</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm table-striped table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Producto</th>
                      <th>Tipo</th>
                      <th>Cantidad</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...ventas, ...produccion]
                      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                      .slice(0, 5)
                      .map((item, index) => (
                        <tr key={index}>
                          <td>{new Date(item.fecha).toLocaleDateString()}</td>
                          <td>{item.producto_nombre || item.nombre}</td>
                          <td>
                            <span className={`badge ${item.total ? 'bg-success' : 'bg-primary'}`}>
                              {item.total ? 'Venta' : 'Producción'}
                            </span>
                          </td>
                          <td>{item.cantidad_vendida || item.cantidad}</td>
                          <td>
                            <span className="badge bg-light text-dark border">${item.total || item.costo_total}</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4 col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle text-warning"></i>
              <h6 className="mb-0">Productos próximos a vencer</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm table-striped table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Vencimiento</th>
                      <th>Producto</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosConVencimiento.map((producto, index) => (
                      <tr key={index}>
                        <td>{new Date(producto.fecha_vencimiento).toLocaleDateString()}</td>
                        <td className="text-truncate" style={{maxWidth: '120px'}}>{producto.nombre}</td>
                        <td>
                          <span className={`badge ${producto.estado === 'Vencido' ? 'bg-danger' : 'bg-warning'}`}>
                            {producto.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex align-items-center gap-2">
              <i className="bi bi-graph-up-arrow text-success"></i>
              <h6 className="mb-0">Artículos con más movimientos</h6>
            </div>
            <div className="card-body">
              <SalesChart data={filteredVentas} />
            </div>
          </div>
        </div>
        <div className="col-lg-6 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex align-items-center gap-2">
              <i className="bi bi-bar-chart-line text-info"></i>
              <h6 className="mb-0">Producción Mensual</h6>
            </div>
            <div className="card-body">
              <ProductionChart data={filteredProduccion} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
