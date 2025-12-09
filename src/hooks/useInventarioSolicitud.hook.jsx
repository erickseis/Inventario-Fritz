// obtenerRequerimientos
import { useEffect, useState } from "react";
import { obtenerRequerimientos } from "../service/connection";

export const useInventarioSolicitudes = () => {
  const [solicitudesInventario, setSolicitudesInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSolicitudes = async () => {
    try {
      const data = await obtenerRequerimientos();
      setSolicitudesInventario(data);
    } catch (error) {
      setError(error.message);
      console.error("Error al obtener requerimientos:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  return {
    fetchSolicitudes,
    solicitudesInventario,
    loading,
    error,
  };
};
