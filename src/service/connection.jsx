import { api } from "./api";

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
