import { createContext, useEffect, useState } from "react";
import { obtenerAlmacenes, obtenerArticulos, obtenerMovimientoDetalleFecha } from "../service/connection";

export const DataMovimientosContext = createContext();

export const DataMovimientosProvider = ({children})=>{
    const [dataMovimientoFecha, setDataMovimientoFecha] = useState([])
      const [dataArticulos, setDataArticulos] = useState([])
      const [dataAlmacenes, setDataAlmacenes] = useState([])
    const [dataLoaded, setDataLoaded] = useState(false);

    const fetchData=async()=>{
        try {
            const [movimientos, articulos,almacenes]=await Promise.all([
                obtenerMovimientoDetalleFecha('2025-08-01', 'VESAMA04'),
                obtenerArticulos(),
                obtenerAlmacenes()
            ])
            setDataAlmacenes(almacenes)
            setDataArticulos(articulos)
            setDataMovimientoFecha(movimientos)
          setDataLoaded(true)
        } catch (error) {
          console.error("Error al obtener almacenes:", error.message);
        }
      }
    
      useEffect(() => {
        
      if(!dataLoaded){
        fetchData()

      }
      }, [dataLoaded]);

    return(
        <DataMovimientosContext.Provider value={{dataMovimientoFecha,dataArticulos,dataAlmacenes,dataLoaded,setDataLoaded}}>
            {children}
        </DataMovimientosContext.Provider>
    )
}