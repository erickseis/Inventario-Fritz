import { createContext, useEffect, useState } from "react";

import {
  obtenerAlmacenes,
  obtenerArticulos,
  obtenerMovimientoDetalleFecha,
} from "../service/connection";

const fechaInicioMes = () => {
  const fechaHoy = new Date();
  let mes = fechaHoy.getMonth() + 1; // Meses van de 0 a 11, por eso se suma 1
  const anio = fechaHoy.getFullYear();

  // Asegurarse de que mes y día tengan dos dígitos

  mes = mes < 10 ? `0${mes}` : mes;

  const fechaFin = `${anio}-${mes}-01`;
  return fechaFin;
};
export const DataMovimientosContext = createContext();

export const DataMovimientosProvider = ({ children }) => {
  const [dataMovimientoFecha, setDataMovimientoFecha] = useState([]);
  const [dataArticulos, setDataArticulos] = useState([]);
  const [dataAlmacenes, setDataAlmacenes] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(true);
  const [searchFechaContext, setSearchFechaContext] = useState(
    fechaInicioMes(),
  );
  const [searchCoArtContext, setSearchCoArtContext] = useState("");
  const fetchArticulos = async () => {
    try {
      const articulos = await obtenerArticulos();
      const almacenes = await obtenerAlmacenes();
      setDataArticulos(articulos);
      setDataAlmacenes(almacenes);
    } catch (error) {
      console.error("Error al obtener articulos:", error.message);
    }
  };
  const fetchData = async () => {
    try {
      setIsLoaded(true);
      const [movimientos] = await Promise.all([
        obtenerMovimientoDetalleFecha(searchFechaContext, searchCoArtContext),
      ]);
      setDataMovimientoFecha(movimientos);
      setDataLoaded(true);
    } catch (error) {
      console.error("Error al obtener almacenes:", error.message);
    } finally {
      setIsLoaded(false);
    }
  };

  // Fetch once on mount
  useEffect(() => {
    fetchData();
    fetchArticulos();
  }, []);
  console.log("0dataArticulos context", dataArticulos);
  return (
    <DataMovimientosContext.Provider
      value={{
        dataMovimientoFecha,
        dataArticulos,
        dataAlmacenes,
        dataLoaded,
        setDataLoaded,
        isLoaded,
        setSearchFechaContext,
        setSearchCoArtContext,
        searchFechaContext,
        searchCoArtContext,
        // expose manual refetch for simple filters
        refetchMovimientos: fetchData,
      }}
    >
      {children}
    </DataMovimientosContext.Provider>
  );
};
