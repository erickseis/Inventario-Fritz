import { useContext, useMemo } from 'react';
import { DataMovimientosContext } from '../hooks/movimientos.context';

const Movimientos = () => {
  // Datos de ejemplo (mock) para reemplazar con datos reales luego
  const{dataMovimientoFecha,dataArticulos,dataAlmacenes }=useContext(DataMovimientosContext);


   const badgeByTipo = (tipo) => {
    switch (tipo) {
      case 'Traslado': return 'badge bg-danger-subtle text-danger border';
      case 'Ajuste': return 'badge bg-warning-subtle text-warning border';
      case 'Factura': return 'badge bg-success-subtle text-success border';
      case 'Devolucion': return 'badge bg-info-subtle text-info border';
      case 'Entrada': return 'badge bg-primary-subtle text-primary border';
      case 'Salida': return 'badge bg-secondary-subtle text-secondary border';
      default: return 'badge bg-secondary-subtle text-dark border';
    }
  };
   const uniByTipo = (uni) => {
    switch (uni) {
      case 'BULT': return 'badge bg-danger-subtle text-danger border';
      case 'CAJ': return 'badge bg-warning-subtle text-warning border';
      case 'DIS': return 'badge bg-success-subtle text-success border';
      case 'KG': return 'badge bg-info-subtle text-info border';
      case 'SACO': return 'badge bg-primary-subtle text-primary border';
      case 'UNI': return 'badge bg-secondary-subtle text-secondary border';
      default: return 'badge bg-secondary-subtle text-dark border';
    }
  };

  const formatDate = (s) => new Date(s).toLocaleDateString();
  const formatNumber = (n) => Number(n || 0).toLocaleString('es-VE');

const articulosMap = useMemo(()=>{
  if(!dataArticulos)return{};
  return dataArticulos.reduce((map, articulo)=>{
    map[articulo.co_art.trim()]=articulo.ced_des;
    return map;
  }, {})
}, [dataArticulos])

const almacenesMap = useMemo(()=>{
if(!dataAlmacenes)return{};
return dataAlmacenes.reduce((map,almacen)=>{
  map[Number(almacen.co_sub)]=almacen.des_sub;
  return map;
},{})
},[dataAlmacenes])

const primeros30 = dataMovimientoFecha
  .sort((a, b) => {
    // Convertir las fechas a timestamps
    const fechaA = new Date(a.fecha).getTime();
    const fechaB = new Date(b.fecha).getTime();

    // Ordenar por fecha descendente
    if (fechaA !== fechaB) {
      return fechaB - fechaA;
    }

    // Si las fechas son iguales, ordenar por código de artículo
    if (a.co_art !== b.co_art) {
      return a.co_art.localeCompare(b.co_art);
    }

    // Si los códigos de artículo son iguales, ordenar por cantidad
    return b.total_art - a.total_art;
  })
  ;


  if(!dataMovimientoFecha, !dataArticulos, !dataAlmacenes){
    return    (
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
            <i className="bi bi-arrow-left-right"></i>
            <h5 className="mb-0">Movimientos</h5>
          </div>
          <small className="text-white-75">Resumen de actividad y próximos vencimientos</small>
        </div>
      </div>

      <div className="row g-3">
        {/* Movimientos recientes */}
        <div className="col-12">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white d-flex align-items-center gap-2">
              <i className="bi bi-clock-history text-primary"></i>
              <h6 className="mb-0">Movimientos recientes</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Numero</th>
                      <th>Tipo</th>
                      <th>Código Articulo</th>
                      <th>Descripción</th>
                      <th>Almacén</th>
                      <th className="text-end">Cantidad</th>
                      <th className='text-end'>Unidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {primeros30.map((m) => (
                      <tr key={m.rowguid}>
                        <td>{formatDate(m.fecha)}</td>
                        <td>{m.numero}</td>
                        <td>
                        <span className={badgeByTipo(m.tipo)} style={{marginRight:'5px'}}>{m.tipo}</span>
                        <span className={badgeByTipo(m.tipo2)}>{m.tipo2}</span>
                        </td>
                        <td><span className="badge bg-light text-dark border">{m.co_art}</span></td>
                        <td style={{maxWidth:'350px'}}>{articulosMap[m.co_art.trim()]|| 'articulo no encontrado'}</td>
                        <td><span className="badge bg-light text-dark border" style={{marginRight:'5px'}}>{m.co_alma}</span>{almacenesMap[m.co_alma]|| 'almacen no encontrado'}</td>
                        <td className="text-end">{formatNumber(m.total_art)}</td>
                        <td className='text-end'>  <span className={badgeByTipo(m.uni_venta)} style={{marginRight:'5px'}}>{m.uni_venta}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

     
      </div>
    </div>
  );
};

export default Movimientos;
