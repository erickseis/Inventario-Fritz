import Select from "react-select";
import { v4 as uuidv4 } from 'uuid';
import { useContext, useEffect, useMemo, useState } from "react";
import { DataMovimientosContext } from "../hooks/movimientos.context";
import { obtenerMovimientoFiltros } from "../service/connection";
import Swal from "sweetalert2";
const fechaFinHoy = () => {
  let fechaHoy = new Date();
  let dia = fechaHoy.getDate();
  let mes = fechaHoy.getMonth() + 1; // Meses van de 0 a 11, por eso se suma 1
  let anio = fechaHoy.getFullYear();

  // Asegurarse de que mes y día tengan dos dígitos
  dia = dia < 10 ? `0${dia}` : dia;
  mes = mes < 10 ? `0${mes}` : mes;

  let fechaFin = `${anio}-${mes}-${dia}`;
  return fechaFin;
};
const fechaInicioMes = () => {
  let fechaHoy = new Date();
  let mes = fechaHoy.getMonth() + 1; // Meses van de 0 a 11, por eso se suma 1
  let anio = fechaHoy.getFullYear();

  // Asegurarse de que mes y día tengan dos dígitos

  mes = mes < 10 ? `0${mes}` : mes;

  let fechaFin = `${anio}-${mes}-01`;
  return fechaFin;
};
console.log('fechaFin', fechaFinHoy());
const Movimientos = () => {
  const [dataMovimientosFiltrados, setDataMovimientosFiltrados] = useState([]);
  const [searchCoAlma, setSearchCoAlma] = useState("");
  const [searchFechaInicio, setSearchFechaInicio] = useState(fechaInicioMes());
  const [searchFechaFin, setSearchFechaFin] = useState(fechaFinHoy());
  const [filtroSimple, setFiltroSimple] = useState(false);
  const [isLoadingAdv, setIsLoadingAdv] = useState(false);
  const {
    dataMovimientoFecha,
    dataArticulos,
    dataAlmacenes,
    isLoaded,
    setSearchFechaContext,
    setSearchCoArtContext,
    searchFechaContext,
    searchCoArtContext,
    refetchMovimientos,
  } = useContext(DataMovimientosContext);

  const fetchMovimientosFiltrados = async (
    co_art,
    co_alma,
    fecha_inicio,
    fecha_fin
  ) => {
    try {
      const resFiltrados = await obtenerMovimientoFiltros(
        co_art,
        co_alma,
        fecha_inicio,
        fecha_fin
      );
      setDataMovimientosFiltrados(resFiltrados);
    } catch (error) {
      console.error("Error al obtener movimientos:", error.message);
    }
  };

  // Ejecutar búsqueda según modo al hacer click
  const onBuscar = async () => {
    if(!searchCoArtContext ){
      return Swal.fire({
        title:'Error',
        text:'Debe seleccionar un articulo',
        icon:'error'
      })
    }
    
    if (filtroSimple) {
      try {
        setIsLoadingAdv(true);
        await refetchMovimientos();
      } catch (error) {
        console.error("Error al obtener movimientos:", error.message);
      }finally{
        setIsLoadingAdv(false);
      }
    } else {
      setIsLoadingAdv(true);
      try {
        if(searchFechaFin < searchFechaInicio ){
          return Swal.fire({
            title:'Error',
            text:'La fecha de inicio no puede ser mayor a la fecha de fin',
            icon:'error'
          })
        }else{
          if(!searchCoAlma){
            return Swal.fire({
              title:'Error',
              text:'Debe seleccionar un almacen',
              icon:'error'
            })
          }
          await fetchMovimientosFiltrados(
            searchCoArtContext,
            searchCoAlma,
            searchFechaInicio,
            searchFechaFin
          );
        }
      } finally {
        setIsLoadingAdv(false);
      }
    }
  };

  const badgeByTipo = (tipo) => {
    switch (tipo) {
      case "Traslado":
        return "badge bg-danger-subtle text-danger border";
      case "Ajuste":
        return "badge bg-warning-subtle text-warning border";
      case "Factura":
        return "badge bg-success-subtle text-success border";
      case "Devolucion":
        return "badge bg-info-subtle text-info border";
      case "Entrada":
        return "badge bg-primary-subtle text-primary border";
      case "Salida":
        return "badge bg-secondary-subtle text-secondary border";
      default:
        return "badge bg-secondary-subtle text-dark border";
    }
  };
 
  const formatDate = (s) => new Date(s).toLocaleDateString();
  const formatNumber = (n) => Number(n || 0).toLocaleString("es-VE");

  const articulosMap = useMemo(() => {
    if (!dataArticulos) return {};
    return dataArticulos.reduce((map, articulo) => {
      map[articulo.co_art.trim()] = articulo.art_des;
      return map;
    }, {});
  }, [dataArticulos]);

  const almacenesMap = useMemo(() => {
    if (!dataAlmacenes) return {};
    return dataAlmacenes.reduce((map, almacen) => {
      map[Number(almacen.co_sub)] = almacen.des_sub;
      return map;
    }, {});
  }, [dataAlmacenes]);

  // Lista a renderizar: simple => dataMovimientoFecha; avanzado => dataMovimientosFiltrados
  const lista = useMemo(() => {
    const base = filtroSimple ? dataMovimientoFecha : dataMovimientosFiltrados;
    return [...(base || [])].sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();
      if (fechaA !== fechaB) return fechaB - fechaA; // desc
      if (a.co_art !== b.co_art) return a.co_art.localeCompare(b.co_art);
      return b.total_art - a.total_art;
    });
  }, [filtroSimple, dataMovimientoFecha, dataMovimientosFiltrados]);

  const handleFiltroSimple = () => {
    setFiltroSimple((prev) => {
      const next = !prev;
      // when switching to advanced, perform an initial fetch
      if (!next) {
        setIsLoadingAdv(true);
        fetchMovimientosFiltrados(
          searchCoArtContext,
          searchCoAlma,
          searchFechaInicio,
          searchFechaFin
        ).finally(() => setIsLoadingAdv(false));
      }
      return next;
    });
    setSearchCoArtContext("");
    setSearchCoAlma("");
  };

  const options = Object.keys(articulosMap || {}).map((co) => ({
    value: co,
    label: `${co} - ${articulosMap[co]}`,
  }));
  const optionsAlmacenes = Object.keys(almacenesMap || {}).map((co) => ({
    value: co,
    label: `${co} - ${almacenesMap[co]}`,
  }));

  console.log('lista',lista)

  return (
    <div className="container py-3">
      <div className="card border-0 shadow-sm overflow-hidden mb-3">
        <div
          className="p-4 d-flex align-items-center justify-content-between"
          style={{
            background: "linear-gradient(90deg, #0d6efd 0%, #6ea8fe 100%)",
          }}
        >
          <div className="d-flex align-items-center gap-2 text-white">
            <i className="bi bi-arrow-left-right"></i>
            <h5 className="mb-0">Movimientos</h5>
          </div>
          <small className="text-white-75">
            Resumen de actividad y próximos vencimientos
          </small>
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
            {/* Filtros */}

            <div className="card mb-4 shadow-sm">
              <div className="card-header bg-white d-flex align-items-center gap-2">
                <i className="bi bi-funnel text-primary"></i>
                <h6 className="mb-0">Filtros</h6>
              </div>
              <div className="d-flex justify-content-end">
                <button
                  className={
                    filtroSimple
                      ? "btn btn-primary p-2 my-2"
                      : "btn btn-primary p-2 my-2"
                  }
                  style={{
                    width: "400px",
                    marginRight: "auto",
                    marginLeft: "auto",
                  }}
                  onClick={handleFiltroSimple}
                >
                  {filtroSimple ? "Filtro Avanzado" : "Filtro Simple"}
                </button>
              </div>
              {filtroSimple ? (
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <option value="">Buscar</option>
                      <Select
                  
                      className="form-control"
                        options={options}
                        isClearable
                        isSearchable
                        placeholder="Seleccione"
                        onChange={(opt) =>
                          setSearchCoArtContext(opt?.value || "")
                        }
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">A partir de</label>
                      <input
                        type="date"
                        className="form-control"
                        value={!searchFechaContext ? fechaInicioMes() : searchFechaContext }
                        onChange={(e) => setSearchFechaContext(e.target.value)}
                      />
                    </div>

                    <div>
                      <button className="btn btn-primary" onClick={onBuscar}  disabled={isLoadingAdv}>
                      {isLoadingAdv ? "Buscando..." : "Buscar"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Buscar</label>
                      <div className="input-group">
                      <Select
                      className="form-control"
                        options={options}
                        isClearable
                        isSearchable
                        placeholder="Seleccione"
                        onChange={(opt) =>
                          setSearchCoArtContext(opt?.value || "")
                        }
                      />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Almacenes</label>
                      <Select
                      className="form-control"
                        options={optionsAlmacenes}
                        isClearable
                        isSearchable
                        placeholder="Seleccione"
                        onChange={(opt) =>
                          setSearchCoAlma(opt?.value || "")
                        }
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Fecha Inicio</label>
                      <input
                        type="date"
                        className="form-control"
                        value={!searchFechaInicio ? fechaInicioMes() : searchFechaInicio }
                        onChange={(e) => setSearchFechaInicio(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Fecha Fin</label>
                      <input
                        type="date"
                        className="form-control"
                        value={!searchFechaFin ? fechaFinHoy() : searchFechaFin }
                        onChange={(e) => setSearchFechaFin(e.target.value)}
                      />
                    </div>
                    <div>
                      <button
                        className="btn btn-primary"
                        onClick={onBuscar}
                        disabled={isLoadingAdv}
                      >
                        {isLoadingAdv ? "Buscando..." : "Buscar"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                { isLoadingAdv && (
                  <div className="d-flex justify-content-center align-items-center py-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                  </div>
                )}
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
                      <th className="text-end">Unidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    { lista.length > 0? lista.map((m) => (
                    <tr key={uuidv4()}>
                        <td>{formatDate(m.fecha)}</td>
                        <td>{m.numero}</td>
                        <td>
                          <span
                            className={badgeByTipo(m.tipo)}
                            style={{ marginRight: "5px" }}
                          >
                            {m.tipo}
                          </span>
                          <span className={badgeByTipo(m.tipo2)}>
                            {m.tipo2}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {m.co_art}
                          </span>
                        </td>
                        <td style={{ maxWidth: "350px" }}>
                          {articulosMap[m.co_art.trim()] ||
                            "articulo no encontrado"}
                        </td>
                        <td>
                          <span
                            className="badge bg-light text-dark border"
                            style={{ marginRight: "5px" }}
                          >
                            {m.co_alma}
                          </span>
                          {almacenesMap[m.co_alma] || "almacen no encontrado"}
                        </td>
                        <td className="text-end">
                          {formatNumber(m.total_art)}
                        </td>
                        <td className="text-end">
                          {" "}
                          <span
                            className={badgeByTipo(m.uni_venta)}
                            style={{ marginRight: "5px" }}
                          >
                            {m.uni_venta}
                          </span>
                        </td>
                      </tr>
                    )):
                    <tr>
                      <td colSpan="8" className="text-center">
                        Usa el filtro para poder ver informacion en este campo
                      </td>
                    </tr>}
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
