import api from "./api";

export const obtenerUsuarioLogueado = async (id) => {
  try {
    const response = await api.get(`/users/inventario/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener datos del servidor:", error.message);
  }
};
//vendedores
export const obtenerVendedores = async () => {
  try {
    const response = await api.get("/vendedor/todos");
    return response.data;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error(
        "Error: La conexión con el servidor tardó demasiado tiempo",
      );
    } else if (error.response?.status === 404) {
      console.error("Error: El endpoint /vendedores no fue encontrado");
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener datos del servidor:", error.message);
    }
    return [];
  }
};
// cargos
export const obtenerCargos = async () => {
  try {
    const response = await api.get("/cargos");
    return response.data;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error(
        "Error: La conexión con el servidor tardó demasiado tiempo",
      );
    } else if (error.response?.status === 404) {
      console.error("Error: El endpoint /cargos no fue encontrado");
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener datos del servidor:", error.message);
    }
    return [];
  }
};
// departamentos
export const obtenerDepartamentos = async () => {
  try {
    const response = await api.get("/departamentos");
    return response.data;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error(
        "Error: La conexión con el servidor tardó demasiado tiempo",
      );
    } else if (error.response?.status === 404) {
      console.error("Error: El endpoint /departamentos no fue encontrado");
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener datos del servidor:", error.message);
    }
    return [];
  }
};
// productos

export const obtenerInventario = async () => {
  try {
    const response = await api.get("/inventario");
    return response.data;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error(
        "Error: La conexión con el servidor tardó demasiado tiempo",
      );
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
export const obtenerStockMin = async () => {
  try {
    const response = await api.get("/inventario/todos");
    return response.data;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error(
        "Error: La conexión con el servidor tardó demasiado tiempo",
      );
    } else if (error.response?.status === 404) {
      console.error("Error: El endpoint /todos no fue encontrado");
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener datos del servidor:", error.message);
    }
    return [];
  }
};
export const stockMinimo = async (data) => {
  try {
    const response = await api.post("/inventario", data);
    return response.data;
  } catch (error) {
    console.error("Error al obtener datos del servidor:", error.message);
  }
};

// Promedio de ventas por SKU (para comparar sobrecupos)
export const obtenerPromedioVentasSKU = async (sku) => {
  if (!sku) return null;
  try {
    const response = await api.get(
      `/ventas/promedio/${encodeURIComponent(String(sku).trim())}`,
    );
    return response.data; // puede ser numero o {promedio: X}
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error(
        "Error: La conexión con el servidor tardó demasiado tiempo",
      );
    } else if (error.response?.status === 404) {
      console.error(
        "Error: El endpoint de promedio de ventas no fue encontrado",
      );
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener promedio de ventas:", error.message);
    }
    return null;
  }
};

// Crear solicitud de requerimiento
export const crearRequerimiento = async (data) => {
  try {
    const response = await api.post("/solicitud-productos", data);
    return response.data;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error(
        "Error: La conexión con el servidor tardó demasiado tiempo",
      );
    } else if (error.response?.status === 404) {
      console.error("Error: El endpoint /requerimientos no fue encontrado");
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al crear requerimiento:", error.message);
    }
    throw error;
  }
};

export const obtenerRequerimientos = async () => {
  try {
    const response = await api.get("/solicitud-productos");
    return response.data;
  } catch (error) {
    console.error("Error al obtener requerimientos:", error.message);
    if (error.code === "ECONNABORTED") {
      console.error(
        "Error: La conexión con el servidor tardó demasiado tiempo",
      );
    } else if (error.response?.status === 404) {
      console.error("Error: El endpoint /requerimientos no fue encontrado");
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener requerimientos:", error.message);
    }
    throw error;
  }
};

export const actualizarRequerimiento = async (id, data) => {
  try {
    const response = await api.patch(
      `/solicitud-productos/actualizar/${id}`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error("error al actualizar los datos", error.message);
    throw error;
  }
};

export const obtenerMovimientoSKU = async () => {
  try {
    const response = await api.get("/inventario/movimientos-sku");
    return response.data;
  } catch (error) {
    console.error("Error al obtener movimientos:", error.message);
    if (error.code === "ECONNABORTED") {
      console.error(
        "Error: La conexión con el servidor tardó demasiado tiempo",
      );
    } else if (error.response?.status === 404) {
      console.error("Error: El endpoint /movimientos no fue encontrado");
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener movimientos:", error.message);
    }
    throw error;
  }
};

export const obtenerMovimientoDetalleFecha = async (fecha, co_art) => {
  try {
    const response = await api.get(
      `/inventario/movimientos/detalle/${fecha}/${co_art}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener movimientos:", error.message);
    if (error.code === "ECONNABORTED") {
      console.error(
        "Error: La conexión con el servidor tardó demasiado tiempo",
      );
    } else if (error.response?.status === 404) {
      console.error(
        "Error: El endpoint /movimientos/detalle no fue encontrado",
      );
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener movimientos:", error.message);
    }
    throw error;
  }
};
export const obtenerMovimientoFiltros = async (
  co_art,
  co_alma,
  fecha_inicio,
  fecha_fin,
) => {
  try {
    const response = await api.get(
      `/inventario/movimientos/filtro_detalle/${co_art}/${co_alma}/${fecha_inicio}/${fecha_fin}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener movimientos:", error.message);
    if (error.code === "ECONNABORTED") {
      console.error(
        "Error: La conexión con el servidor tardó demasiado tiempo",
      );
    } else if (error.response?.status === 404) {
      console.error(
        "Error: El endpoint /movimientos/detalle no fue encontrado",
      );
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    } else {
      console.error("Error al obtener movimientos:", error.message);
    }
    throw error;
  }
};

export const obtenerArticulos = async () => {
  try {
    const response = await api.get("/articulos-full");
    return response.data;
  } catch (error) {
    console.error("Error al obtener articulos:", error.message);
  }
};

export const obtenerArticulosAppVentas = async () => {
  try {
    const response = await api.get("/articulos-full/app-ventas");
    return response.data;
  } catch (error) {
    console.error("Error al obtener articulos app ventas:", error.message);
    if (error.code === "ECONNABORTED") {
      console.error(
        "Error: La conexión con el servidor tardó demasiado tiempo",
      );
    } else if (error.response?.status === 404) {
      console.error(
        "Error: El endpoint /articulos-full/app-ventas no fue encontrado",
      );
    } else if (error.response?.status >= 500) {
      console.error("Error: Problema en el servidor");
    }
    return [];
  }
};
export const obtenerAlmacenes = async () => {
  try {
    const response = await api.get("/almacenes");
    return response.data;
  } catch (error) {
    console.error("Error al obtener almacenes:", error.message);
  }
};

// CUOTAS - Gestión de cuotas solicitadas y enviadas
export const obtenerCuotas = async (params = {}) => {
  try {
    const query = new URLSearchParams();
    if (params.periodo) query.append("periodo", params.periodo);
    if (params.co_art) query.append("co_art", params.co_art);
    if (params.co_alma) query.append("co_alma", params.co_alma);
    if (params.includeHistorial) query.append("includeHistorial", "true");

    const suffix = query.toString() ? `?${query.toString()}` : "";
    const response = await api.get(`/cuotas${suffix}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener cuotas:", error.message);
    return [];
  }
};

export const obtenerCuotaPorArticulo = async (co_art, params = {}) => {
  if (!co_art) return [];
  try {
    const query = new URLSearchParams();
    if (params.periodo) query.append("periodo", params.periodo);
    if (params.includeHistorial) query.append("includeHistorial", "true");
    const suffix = query.toString() ? `?${query.toString()}` : "";

    const response = await api.get(
      `/cuotas/${encodeURIComponent(String(co_art).trim())}${suffix}`,
    );
    const data = response.data;
    if (Array.isArray(data)) return data;
    return data ? [data] : [];
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Error al obtener cuota:", error.message);
    return [];
  }
};

export const guardarCuota = async (data) => {
  try {
    const response = await api.post("/cuotas", data);
    return response.data;
  } catch (error) {
    console.error("Error al guardar cuota:", error.message);
    throw error;
  }
};

export const guardarCuotasEnBatch = async ({ periodo, cuotas, nota } = {}) => {
  try {
    const payload = { cuotas };
    if (periodo) payload.periodo = periodo;
    if (nota) payload.nota = nota;
    const response = await api.post("/cuotas/batch", payload);
    return response.data;
  } catch (error) {
    console.error("Error al guardar cuotas en batch:", error.message);
    throw error;
  }
};

export const eliminarCuota = async ({ co_art, co_alma, periodo } = {}) => {
  if (!co_art) throw new Error("co_art es requerido para eliminar una cuota.");
  try {
    const query = new URLSearchParams();
    if (co_alma) query.append("co_alma", co_alma);
    if (periodo) query.append("periodo", periodo);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    const response = await api.delete(
      `/cuotas/${encodeURIComponent(String(co_art).trim())}${suffix}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error al eliminar cuota:", error.message);
    throw error;
  }
};

// CONTROL INTERNO - Listas de carga
export const obtenerListasControl = async () => {
  try {
    const response = await api.get("/control-interno/lists");
    return response.data;
  } catch (error) {
    console.error("Error al obtener listas de control interno:", error.message);
    throw error;
  }
};

export const crearListaControl = async (data) => {
  try {
    const response = await api.post("/control-interno/lists", data);
    return response.data;
  } catch (error) {
    console.error("Error al crear lista de control interno:", error.message);
    throw error;
  }
};

export const crearItemControl = async (listaId, data) => {
  try {
    const response = await api.post(
      `/control-interno/lists/${listaId}/items`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Error al crear ítem de control interno:", error.message);
    throw error;
  }
};

export const ajustarItemControl = async (itemId, data) => {
  try {
    const response = await api.patch(
      `/control-interno/items/${itemId}/adjust`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error("Error al ajustar ítem de control interno:", error.message);
    throw error;
  }
};

export const resetearItemControl = async (itemId) => {
  try {
    const response = await api.post(`/control-interno/items/${itemId}/reset`);
    return response.data;
  } catch (error) {
    console.error("Error al reiniciar ítem de control interno:", error.message);
    throw error;
  }
};

export const obtenerHistorialItemControl = async (itemId) => {
  try {
    const response = await api.get(`/control-interno/items/${itemId}/history`);
    return response.data;
  } catch (error) {
    console.error(
      "Error al obtener historial de control interno:",
      error.message,
    );
    throw error;
  }
};

export const consultarDatosProfit = async ({
  fecha_inicio,
  fecha_fin,
  co_art,
}) => {
  try {
    const params = new URLSearchParams({
      fecha_inicio,
      fecha_fin,
    });
    if (co_art) {
      params.append("co_art", co_art);
    }
    const response = await api.get(
      `/control-interno/consultar-profit?${params}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error al consultar datos de Profit:", error.message);
    throw error;
  }
};
