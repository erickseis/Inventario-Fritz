import api from "./api";

export const obtenerUsuarioLogueado = async (id) => {
  try {
    const response = await api.get(`/users/inventario/${id}`)
    return response.data
  } catch (error) {
    console.error("Error al obtener datos del servidor:", error.message);
  }
}
//vendedores
export const obtenerVendedores = async () => {
  try {
    const response = await api.get("/vendedor/todos")
    return response.data
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error("Error: La conexión con el servidor tardó demasiado tiempo");
    } else if (error.response?.status === 404) {
      console.error("Error: El endpoint /vendedores no fue encontrado");
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener datos del servidor:", error.message);
    }
    return [];
  }
}
// cargos
export const obtenerCargos = async () => {
  try {
    const response = await api.get("/cargos")
    return response.data
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error("Error: La conexión con el servidor tardó demasiado tiempo");
    } else if (error.response?.status === 404) {
      console.error("Error: El endpoint /cargos no fue encontrado");
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener datos del servidor:", error.message);
    }
    return [];
  }
}
// departamentos
export const obtenerDepartamentos = async () => {
  try {
    const response = await api.get("/departamentos")
    return response.data
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error("Error: La conexión con el servidor tardó demasiado tiempo");
    } else if (error.response?.status === 404) {
      console.error("Error: El endpoint /departamentos no fue encontrado");
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener datos del servidor:", error.message);
    }
    return [];
  }
}
// productos

export const obtenerInventario = async () => {
  try {
    const response = await api.get("/inventario")
    return response.data
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error("Error: La conexión con el servidor tardó demasiado tiempo");
    } else if (error.response?.status === 404) {
      console.error("Error: El endpoint /inventario no fue encontrado");
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener datos del servidor:", error.message);
    }
    return [];
  }
};
export const obtenerStockMin=async()=>{
  try {
    const response = await api.get("/inventario/todos")
    return response.data
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error("Error: La conexión con el servidor tardó demasiado tiempo");
    } else if (error.response?.status === 404) {
      console.error("Error: El endpoint /todos no fue encontrado");
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener datos del servidor:", error.message);
    }
    return [];
  }
}
export const stockMinimo = async (data) => {
try {
  const response = await api.post("/inventario", data)
  return response.data
} catch (error) {
  console.error("Error al obtener datos del servidor:", error.message);
}
}

// Promedio de ventas por SKU (para comparar sobrecupos)
export const obtenerPromedioVentasSKU = async (sku) => {
  if (!sku) return null;
  try {
    const response = await api.get(`/ventas/promedio/${encodeURIComponent(String(sku).trim())}`);
    return response.data; // puede ser numero o {promedio: X}
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error("Error: La conexión con el servidor tardó demasiado tiempo");
    } else if (error.response?.status === 404) {
      console.error("Error: El endpoint de promedio de ventas no fue encontrado");
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener promedio de ventas:", error.message);
    }
    return null;
  }
}

// Crear solicitud de requerimiento
export const crearRequerimiento = async (data) => {
  try {
    const response = await api.post('/solicitud-productos', data);
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error("Error: La conexión con el servidor tardó demasiado tiempo");
    } else if (error.response?.status === 404) {
      console.error("Error: El endpoint /requerimientos no fue encontrado");
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al crear requerimiento:", error.message);
    }
    throw error;
  }
}

export const obtenerRequerimientos = async()=>{
  try {
    const response = await api.get('/solicitud-productos')
    return response.data
  } catch (error) {
    console.error("Error al obtener requerimientos:", error.message);
    if (error.code === 'ECONNABORTED') {
      console.error("Error: La conexión con el servidor tardó demasiado tiempo");
    } else if (error.response?.status === 404) {
      console.error("Error: El endpoint /requerimientos no fue encontrado");
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener requerimientos:", error.message);
    }
    throw error;
  }
}

export const actualizarRequerimiento=async(id, data)=>{
  try {
    const response = await api.patch(`/solicitud-productos/actualizar/${id}`, data)
    return response.data
  } catch (error) {
    console.error("error al actualizar los datos", error.message)
    throw error
  }
}

export const obtenerMovimientoSKU =async()=>{
  try {
    const response = await api.get('/inventario/movimientos-sku')
    return response.data
  } catch (error) {
    console.error("Error al obtener movimientos:", error.message);
    if (error.code === 'ECONNABORTED') {
      console.error("Error: La conexión con el servidor tardó demasiado tiempo");
    } else if (error.response?.status === 404) {
      console.error("Error: El endpoint /movimientos no fue encontrado");
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener movimientos:", error.message);
    }
    throw error;
  }
}

export const obtenerMovimientoDetalleFecha=async(fecha, co_art)=>{
  try {
    const response = await api.get(`/inventario/movimientos/detalle/${fecha}/${co_art}`)
    return response.data
  } catch (error) {
    console.error("Error al obtener movimientos:", error.message);
    if (error.code === 'ECONNABORTED') {
      console.error("Error: La conexión con el servidor tardó demasiado tiempo");
    } else if (error.response?.status === 404) {
      console.error("Error: El endpoint /movimientos/detalle no fue encontrado");
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener movimientos:", error.message);
    }
    throw error;
  }
}
export const obtenerMovimientoFiltros=async(co_art, co_alma, fecha_inicio, fecha_fin)=>{
  try {
    const response = await api.get(`/inventario/movimientos/filtro_detalle/${co_art}/${co_alma}/${fecha_inicio}/${fecha_fin}`)
    return response.data
  } catch (error) {
    console.error("Error al obtener movimientos:", error.message);
    if (error.code === 'ECONNABORTED') {
      console.error("Error: La conexión con el servidor tardó demasiado tiempo");
    } else if (error.response?.status === 404) {
      console.error("Error: El endpoint /movimientos/detalle no fue encontrado");
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener movimientos:", error.message);
    }
    throw error;
  }
}


export const obtenerArticulos = async () => {
try {
  const response = await api.get('/articulos-full')
  return response.data
} catch (error) {
  console.error("Error al obtener articulos:", error.message);
}
}
export const obtenerAlmacenes = async () => {
try {
  const response = await api.get('/almacenes')
  return response.data
} catch (error) {
  console.error("Error al obtener almacenes:", error.message);
}
}

// LISTAS DE CARGA
export const obtenerListasCarga = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta);
    if (filtros.transporte) params.append('transporte', filtros.transporte);
    
    const response = await api.get(`/listas-carga?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener listas de carga:", error.message);
    throw error;
  }
}

export const obtenerDetallesListaCarga = async (listaId) => {
  try {
    const response = await api.get(`/listas-carga/${listaId}/detalles`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener detalles de lista de carga:", error.message);
    throw error;
  }
}

export const agregarCantidad = async (listaId, itemId, cantidad) => {
  try {
    const response = await api.post(`/listas-carga/${listaId}/items/${itemId}/agregar`, { cantidad });
    return response.data;
  } catch (error) {
    console.error("Error al agregar cantidad:", error.message);
    throw error;
  }
}

export const restarCantidad = async (listaId, itemId, cantidad) => {
  try {
    const response = await api.post(`/listas-carga/${listaId}/items/${itemId}/restar`, { cantidad });
    return response.data;
  } catch (error) {
    console.error("Error al restar cantidad:", error.message);
    throw error;
  }
}

export const cerrarGuia = async (listaId) => {
  try {
    const response = await api.post(`/listas-carga/${listaId}/cerrar`);
    return response.data;
  } catch (error) {
    console.error("Error al cerrar guía:", error.message);
    throw error;
  }
}

export const crearListaCarga = async (data) => {
  try {
    const response = await api.post('/listas-carga', data);
    return response.data;
  } catch (error) {
    console.error("Error al crear lista de carga:", error.message);
    throw error;
  }
}