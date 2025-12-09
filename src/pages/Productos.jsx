import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Select from "react-select";
import FormModal from "../components/FormModal";
import { ModalObservacion } from "../components/ModalObservacion";
import { DataMovimientosContext } from "../hooks/movimientos.context";
import { useUser } from "../hooks/useUser";
import {
  guardarCuotasEnBatch,
  obtenerArticulosAppVentas,
  obtenerCuotas,
  obtenerInventario,
  obtenerMovimientoSKU,
  obtenerStockMin,
} from "../service/connection";

const Productos = () => {
  const { dataArticulos } = useContext(DataMovimientosContext);
  const { user } = useUser();
  const u = Array.isArray(user) ? user[0] : user;
  const cargoNombre = u?.cargo_nombre?.toLowerCase() || "";
  const departamentoNombre = u?.departamento_nombre?.toLowerCase() || "";

  // Debug: Ver datos del usuario
  console.log("Usuario en Productos:", u);
  console.log("Cargo nombre:", cargoNombre);
  console.log("Departamento nombre:", departamentoNombre);

  // Determinar si el usuario es de Almacén/Logística o Distribución
  // Almacén/Logística ven TODOS los productos
  // Distribución y otros ven solo APP VENTAS
  const esAlmacenLogistica =
    cargoNombre.includes("almacen") ||
    cargoNombre.includes("logistica") ||
    departamentoNombre.includes("almacen") ||
    departamentoNombre.includes("logistica");

  console.log("¿Es Almacén/Logística?:", esAlmacenLogistica);

  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc', 'desc', or ''
  const [searchTerm, setSearchTerm] = useState("");
  const [vistaComparativa, setVistaComparativa] = useState(false); // Toggle entre vista normal y comparativa
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [dataProductosAlmacenes, setDataProductosAlmacenes] = useState([]);
  const [dataStockMinimo, setDataStockMinimo] = useState([]);
  const [showModalObservacion, setShowModalObservacion] = useState(false);
  const [observacion, setObservacion] = useState("");
  const [articulosAppVentas, setArticulosAppVentas] = useState([]); // Lista de productos de APP VENTAS
  const [selectedAlmacenesComparar, setSelectedAlmacenesComparar] = useState(
    [],
  ); // Almacenes seleccionados para comparar
  const [cuotaSolicitada, setCuotaSolicitada] = useState({}); // Cuotas solicitadas por producto/almacén
  const [cuotaEnviada, setCuotaEnviada] = useState({}); // Cuotas enviadas acumuladas por producto/almacén
  const [cuotaSolicitadaOriginal, setCuotaSolicitadaOriginal] = useState({});
  const [cuotaEnvioPendiente, setCuotaEnvioPendiente] = useState({});
  const [cuotaHistorial, setCuotaHistorial] = useState({});
  // meses para promedio
  const [avgMonths, setAvgMonths] = useState(3);
  // mes base (YYYY-MM)
  const [baseMonth, setBaseMonth] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    return `${yyyy}-${mm}`;
  });
  // mapa de promedios por SKU (co_art)
  const [avgBySKU, setAvgBySKU] = useState({});
  const [movimientosAll, setMovimientosAll] = useState([]);
  const tableScrollContainerRef = useRef(null);
  const tableScrollMirrorWrapperRef = useRef(null);
  const tableScrollMirrorRef = useRef(null);

  const handleShowModalObservacion = () => {
    setShowModalObservacion(!showModalObservacion);
  };
  const almacenes = [
    { co_alma: "7020", nombre: "Barquisimeto principal" },
    { co_alma: "8010", nombre: "Maracaibo (Occidente)" },
    { co_alma: "8060", nombre: "Barcelona (Oriente)" },
    { co_alma: "8070", nombre: "Santa Cruz (Estado Aragua Centro)" },
    { co_alma: "8090", nombre: "Prueba Piloto Capital" },
  ];
  const compactInputStyle = {
    width: "70px",
    minWidth: "70px",
    height: "32px",
    padding: "0 8px",
    fontSize: "0.8rem",
  };
  const compactMetricStyle = { fontSize: "0.78rem" };
  const compactBadgeStyle = { fontSize: "0.65rem", padding: "0.2rem 0.45rem" };
  const fetchStockMinimo = async () => {
    try {
      const data = await obtenerStockMin();
      setDataStockMinimo(data);
      setIsLoading(false);
    } catch (error) {
      console.error("error al obtener los datos del servidor", error);
      setIsLoading(false);
    }
  };
  const fetchDataProductosAlmacenes = async () => {
    try {
      const data = await obtenerInventario();
      setDataProductosAlmacenes(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al obtener la data del servidor", error);
      setIsLoading(false);
    }
  };

  const fetchArticulosAppVentas = async () => {
    try {
      const data = await obtenerArticulosAppVentas();
      setArticulosAppVentas(data);
      setIsLoading(false);
    } catch (error) {
      console.error(
        "Error al obtener articulos app ventas del servidor",
        error,
      );
      setIsLoading(false);
    }
  };

  const buildQuotaKey = (coArt, coAlma) => {
    const art = String(coArt || "").trim();
    if (!art) return "";
    const alma = String(coAlma || "").trim();
    return `${art}__${alma || "GLOBAL"}`;
  };

  const parseQuotaKey = (key) => {
    const [coArt, ...rest] = String(key || "").split("__");
    const coAlmaRaw = rest.join("__");
    return {
      coArt: coArt || "",
      coAlma: coAlmaRaw === "GLOBAL" ? "" : coAlmaRaw,
    };
  };

  const formatShortDateTime = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCuotaSolicitadaChange = (key, value) => {
    if (!key) return;
    const sanitized = Math.max(0, Math.trunc(Number(value) || 0));
    setCuotaSolicitada((prev) => ({
      ...prev,
      [key]: sanitized,
    }));
  };

  const handleCuotaEnvioPendienteChange = (key, rawValue) => {
    if (!key) return;
    if (rawValue === "" || rawValue === null || rawValue === undefined) {
      setCuotaEnvioPendiente((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }
    const sanitized = Math.max(0, Math.trunc(Number(rawValue) || 0));
    setCuotaEnvioPendiente((prev) => ({
      ...prev,
      [key]: sanitized,
    }));
  };

  const fetchCuotas = useCallback(async () => {
    try {
      const data = await obtenerCuotas({
        periodo: baseMonth,
        includeHistorial: true,
      });

      const cuotasSolicitadasMap = {};
      const cuotasSolicitadasOriginalMap = {};
      const cuotasEnviadasMap = {};
      const historialMap = {};

      data.forEach((cuota) => {
        if (!cuota?.co_art) return;
        const key = buildQuotaKey(cuota.co_art, cuota.co_alma);
        if (!key) return;
        const solicitada = Number(cuota.cuota_solicitada || 0);
        const enviada = Number(cuota.cuota_enviada_total || 0);

        cuotasSolicitadasMap[key] = solicitada;
        cuotasSolicitadasOriginalMap[key] = solicitada;
        cuotasEnviadasMap[key] = enviada;
        if (Array.isArray(cuota.historial)) {
          historialMap[key] = cuota.historial;
        }
      });

      setCuotaSolicitada(cuotasSolicitadasMap);
      setCuotaSolicitadaOriginal(cuotasSolicitadasOriginalMap);
      setCuotaEnviada(cuotasEnviadasMap);
      setCuotaEnvioPendiente({});
      setCuotaHistorial(historialMap);
    } catch (error) {
      console.error("Error al obtener cuotas del servidor", error);
    }
  }, [baseMonth]);

  useEffect(() => {
    fetchDataProductosAlmacenes();
    fetchStockMinimo();
    // Solo cargar artículos app ventas si NO es almacén/logística
    if (!esAlmacenLogistica) {
      fetchArticulosAppVentas();
    } else {
      setIsLoading(false);
    }
  }, [esAlmacenLogistica]); // Solo al montar el componente o cuando cambie el rol

  // Cargar cuotas después de tener dataProductosAlmacenes
  useEffect(() => {
    if (dataProductosAlmacenes.length > 0) {
      fetchCuotas();
    }
  }, [dataProductosAlmacenes, fetchCuotas]);

  // Función para guardar las cuotas en el backend
  const handleGuardarCuotas = async () => {
    try {
      const keys = new Set([
        ...Object.keys(cuotaSolicitada),
        ...Object.keys(cuotaEnvioPendiente),
      ]);

      const cuotasPayload = [];

      keys.forEach((key) => {
        if (!key) return;
        const { coArt, coAlma } = parseQuotaKey(key);
        if (!coArt || !coAlma) return;

        const solicitadaActual = Number(cuotaSolicitada[key] ?? 0);
        const solicitadaOriginal = Number(cuotaSolicitadaOriginal[key] ?? 0);
        const incremento = Number(cuotaEnvioPendiente[key] ?? 0);

        const cambioSolicitada = solicitadaActual !== solicitadaOriginal;
        const hayIncremento = Number.isFinite(incremento) && incremento > 0;

        if (cambioSolicitada || hayIncremento) {
          cuotasPayload.push({
            co_art: coArt,
            co_alma: coAlma,
            cuota_solicitada: cambioSolicitada ? solicitadaActual : undefined,
            cuota_enviada_incremento: hayIncremento ? incremento : undefined,
          });
        }
      });

      if (cuotasPayload.length === 0) {
        alert("ℹ️ No hay cambios de cuotas para guardar");
        return;
      }

      await guardarCuotasEnBatch({
        periodo: baseMonth,
        cuotas: cuotasPayload,
      });

      await fetchCuotas();
      alert("✅ Cuotas guardadas exitosamente");
    } catch (error) {
      console.error("Error al guardar cuotas:", error);
      alert("❌ Error al guardar las cuotas");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedCategoria,
    selectedEstado,
    selectedLocation,
    vistaComparativa,
  ]);

  // Función helper para obtener stock mínimo desde dataStockMinimo
  const getStockMinimo = (co_art) => {
    const stockMinData = dataStockMinimo.find(
      (item) => String(item.co_art).trim() === String(co_art)?.trim(),
    );
    return stockMinData ? stockMinData.stock_min : null;
  };

  // Función para formatear números con separador de miles
  const formatNumber = (value) => {
    if (value === null || value === undefined || value === "") return "0";
    const num = Math.floor(Number(value));
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Cargar todos los movimientos una sola vez (el backend no filtra por mes)
  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      try {
        const data = await obtenerMovimientoSKU();
        if (!cancelled) setMovimientosAll(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error obteniendo movimientos:", e?.message || e);
        if (!cancelled) setMovimientosAll([]);
      }
    };
    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);
  // Cálculo de promedio por SKU basado en total_cajas_vendidas de movimientos filtrados por meses
  useEffect(() => {
    let cancelled = false;
    const fetchMovimientos = async () => {
      try {
        // helpers locales para evitar dependencias faltantes
        const pad2 = (n) => String(n).padStart(2, "0");
        const getMonthsFrom = (yyyyMm, n) => {
          // yyyyMm: 'YYYY-MM'
          const [yStr, mStr] = String(yyyyMm).split("-");
          const year = Number(yStr);
          const monthIdx = Number(mStr) - 1; // 0-11
          const out = [];
          for (let i = 0; i < n; i++) {
            const d = new Date(year, monthIdx - i, 1);
            out.push(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}`);
          }
          return out;
        };

        const meses = getMonthsFrom(baseMonth, Number(avgMonths || 1));
        const mesesSet = new Set(meses);
        // Filtrar del dataset completo solo los meses seleccionados
        const filtrados = Array.isArray(movimientosAll)
          ? movimientosAll.filter(
              (mov) => mov?.mes && mesesSet.has(String(mov.mes)),
            )
          : [];
        // Acumular por co_art
        const acumulado = {};
        filtrados.forEach((mov) => {
          const co = String(mov?.co_art || "").trim();
          if (!co) return;
          const cajas = Number(mov?.total_cajas_vendidas || 0);
          acumulado[co] = (acumulado[co] || 0) + cajas;
        });
        // Calcular promedio simple: total acumulado / meses solicitados
        const promedios = {};
        const divisor = Number(avgMonths || 1);
        Object.keys(acumulado).forEach((co) => {
          promedios[co] = acumulado[co] / divisor;
        });
        if (!cancelled) setAvgBySKU(promedios);
      } catch (e) {
        console.error(
          "Error cargando movimientos para promedio:",
          e?.message || e,
        );
        if (!cancelled) setAvgBySKU({});
      }
    };
    fetchMovimientos();
    return () => {
      cancelled = true;
    };
  }, [avgMonths, baseMonth, movimientosAll]);

  const getPromedioMensual = (producto) => {
    const key = String(producto?.co_art || "").trim();
    if (!key) return null;
    const val = avgBySKU[key];
    return typeof val === "number" ? val : null;
  };

  const filtrarProductosPorAlmacen = (data = dataProductosAlmacenes) => {
    const codigosAlmacen =
      selectedLocation === "all"
        ? almacenes.map((almacen) => String(almacen.co_alma).trim())
        : [String(selectedLocation).trim()];

    // Si es almacén/logística, NO filtrar por APP VENTAS (mostrar todos)
    if (esAlmacenLogistica) {
      return data.filter((item) => {
        const itemAlmacen = item.co_alma ? String(item.co_alma).trim() : "";
        return codigosAlmacen.includes(itemAlmacen);
      });
    }

    // Si NO es almacén/logística, filtrar solo APP VENTAS
    const codigosAppVentas = new Set(
      articulosAppVentas.map((art) => String(art.co_art || "").trim()),
    );

    return data.filter((item) => {
      const itemAlmacen = item.co_alma ? String(item.co_alma).trim() : "";
      const itemCoArt = String(item.co_art || "").trim();

      // Filtrar por almacén y por productos de APP VENTAS
      return (
        codigosAlmacen.includes(itemAlmacen) && codigosAppVentas.has(itemCoArt)
      );
    });
  };

  // Función para convertir datos a vista comparativa (pivot por almacén)
  const convertirAVistaComparativa = (datos) => {
    const productosMap = new Map();

    datos.forEach((item) => {
      const co_art = item.co_art?.trim();
      if (!co_art) return;

      if (!productosMap.has(co_art)) {
        productosMap.set(co_art, {
          co_art: co_art,
          art_des: item.art_des,
          categoria_principal: item.categoria_principal,
          campo2: item.campo2,
          campo4: item.campo4,
          es_app_ventas: item.es_app_ventas,
          almacenes: {},
          stock_min: null,
        });
      }

      const producto = productosMap.get(co_art);
      const almacen = item.co_alma?.trim();

      if (almacen) {
        producto.almacenes[almacen] = {
          stock_act: item.stock_act || 0,
          stock_com: item.stock_com || 0,
          stock_lle: item.stock_lle || 0,
          stock_des: item.stock_des || 0,
          stock_disponible: (item.stock_act || 0) - (item.stock_com || 0),
        };
      }
    });

    return Array.from(productosMap.values());
  };
  const columns = [
    {
      key: "co_art",
      label: "Código",
      sortable: true,
      render: (value) => (
        <span className="badge bg-light text-dark border">{String(value)}</span>
      ),
    },
    {
      key: "art_des",
      label: "Descripción",
      sortable: true,
      render: (value) => <span className="fw-semibold">{value}</span>,
    },
    {
      key: "categoria_principal",
      label: "Categoría",
      sortable: true,
      render: (value) => (
        <span className="badge bg-secondary">{value || "—"}</span>
      ),
    },
    {
      key: "stock_disponible",
      label: "Stock Disponible",
      sortable: true,
      render: (_value, producto) => {
        const disponible =
          Number(producto.stock_act || 0) - Number(producto.stock_com || 0);
        return `${formatNumber(disponible)} un`;
      },
    },
    {
      key: "stock_min",
      label: "Stock Mínimo",
      sortable: true,
      render: (value, producto) => {
        const stockMin = getStockMinimo(producto?.co_art?.trim());
        return stockMin !== null
          ? formatNumber(stockMin)
          : formatNumber(value || "0");
      },
    },
    {
      key: "co_alma",
      label: "Almacén",
      sortable: true,
      render: (value) => {
        if (!value) return "Sin almacén";
        const cleanValue = String(value).trim();
        const almacen = almacenes.find(
          (a) => String(a.co_alma).trim() === cleanValue,
        );
        return (
          <span className="badge bg-info-subtle text-dark border">
            {almacen ? almacen.nombre : cleanValue}
          </span>
        );
      },
    },
    {
      key: "cuota_solicitada",
      label: "Cuota mensual",
      sortable: false,
      render: (_value, producto) => {
        const uniqueKey = buildQuotaKey(producto.co_art, producto.co_alma);
        if (!uniqueKey) return "—";
        const cuota = cuotaSolicitada[uniqueKey] ?? 0;

        return (
          <div className="d-flex justify-content-center">
            <input
              type="number"
              className="form-control form-control-sm text-center"
              style={compactInputStyle}
              value={cuota}
              min="0"
              onChange={(e) =>
                handleCuotaSolicitadaChange(uniqueKey, e.target.value)
              }
              placeholder="0"
            />
          </div>
        );
      },
    },
    {
      key: "cuota_enviada_total",
      label: "Avance",
      sortable: false,
      render: (_value, producto) => {
        const uniqueKey = buildQuotaKey(producto.co_art, producto.co_alma);
        if (!uniqueKey) return "—";
        const solicitada = Number(cuotaSolicitada[uniqueKey] || 0);
        const enviada = Number(cuotaEnviada[uniqueKey] || 0);
        const porcentaje =
          solicitada > 0 ? Math.round((enviada / solicitada) * 100) : 0;

        return (
          <div
            className="text-center"
            style={{ minWidth: "90px", fontSize: "0.78rem" }}
          >
            <span className="fw-semibold text-dark">
              {formatNumber(enviada)}
            </span>
            <span className="text-muted">
              {" "}
              / {formatNumber(solicitada || 0)}
            </span>
            {solicitada > 0 && (
              <div className="text-muted" style={{ fontSize: "0.7rem" }}>
                {porcentaje}% cumplido
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "cuota_envio_incremento",
      label: "Enviar",
      sortable: false,
      render: (_value, producto) => {
        const uniqueKey = buildQuotaKey(producto.co_art, producto.co_alma);
        if (!uniqueKey) return "—";
        const incremento = cuotaEnvioPendiente[uniqueKey] ?? "";

        return (
          <div className="d-flex justify-content-center">
            <input
              type="number"
              className="form-control form-control-sm text-center"
              style={compactInputStyle}
              value={incremento}
              min="0"
              onChange={(e) =>
                handleCuotaEnvioPendienteChange(uniqueKey, e.target.value)
              }
              placeholder="+"
            />
          </div>
        );
      },
    },
    {
      key: "promedio",
      label: "Promedio Movimiento",
      sortable: true,
      render: (_value, producto) => {
        const promedio = getPromedioMensual(producto);
        if (promedio === null) return "Sin datos";
        return (
          <span className="badge bg-info-subtle text-dark border">
            {formatNumber(promedio)} un/mes
          </span>
        );
      },
    },
  ];

  // Determinar qué almacenes mostrar en vista comparativa
  const almacenesAMostrar =
    vistaComparativa && selectedAlmacenesComparar.length > 0
      ? almacenes.filter((alm) =>
          selectedAlmacenesComparar.includes(alm.co_alma),
        )
      : almacenes;

  // Colores para cada almacén - Paleta azul claro y tonos fríos suaves
  const almacenColors = {
    7020: { bg: "#e3f2fd", border: "#1976d2", text: "#0d47a1" }, // Azul claro
    8010: { bg: "#e0f2f1", border: "#00897b", text: "#004d40" }, // Verde agua
    8060: { bg: "#e8f5e9", border: "#43a047", text: "#1b5e20" }, // Verde menta
    8070: { bg: "#f1f8e9", border: "#7cb342", text: "#33691e" }, // Verde lima suave
    8090: { bg: "#e1f5fe", border: "#0288d1", text: "#01579b" }, // Azul cielo
  };

  // columnsComparativa se renderiza directamente en el JSX para mayor flexibilidad

  const formFields = [
    { name: "art_des", label: "Descripción", type: "text", required: true },
    {
      name: "categoria_principal",
      label: "Categoría",
      type: "text",
      required: true,
    },
    {
      name: "stock_act",
      label: "Stock Actual",
      type: "number",
      required: true,
    },
    {
      name: "stock_minimo",
      label: "Stock Mínimo",
      type: "number",
      required: true,
    },
    { name: "co_alma", label: "Código Almacén", type: "text", required: false },
  ];

  const editFormFields = [
    {
      name: "co_art",
      label: "Código Articulo",
      type: "text",
      required: false,
      disabled: true,
    },
    {
      name: "stock_min",
      label: "Stock Mínimo",
      type: "number",
      required: true,
    },
    {
      name: "observacion",
      label: "Observación",
      type: "text",
      required: false,
    },
  ];

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  // Filtrar productos - solo muestra los que coinciden con TODOS los filtros activos
  const filteredProductos = filtrarProductosPorAlmacen().filter((producto) => {
    const searchMatch =
      !searchTerm ||
      producto.art_des.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.co_art.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.categoria_principal
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      producto.des_sub?.toLowerCase().includes(searchTerm.toLowerCase());

    const categoriaMatch =
      !selectedCategoria || producto.categoria_principal === selectedCategoria;

    const stockDisponible =
      (producto.stock_act || 0) - (producto.stock_com || 0);

    // Determinar estado actual del producto usando stock_min de dataStockMinimo
    const stockMinimoReal =
      getStockMinimo(producto?.co_art) || producto.stock_minimo || 0;
    let estadoProducto = "";
    if (stockDisponible === 0) {
      estadoProducto = "sin-stock";
    } else if (stockMinimoReal > 0 && stockDisponible <= stockMinimoReal) {
      estadoProducto = "bajo";
    } else if (stockDisponible > 0) {
      estadoProducto = "disponible";
    }

    // Solo mostrar productos que coincidan con el estado seleccionado
    const estadoMatch = !selectedEstado || estadoProducto === selectedEstado;

    return searchMatch && categoriaMatch && estadoMatch;
  });

  // Determinar qué productos mostrar según la vista
  const productosParaMostrar = vistaComparativa
    ? convertirAVistaComparativa(filteredProductos)
    : filteredProductos;

  // Ordenar productos por stock disponible (stock_act - stock_com)
  const sortedProductos = [...productosParaMostrar].sort((a, b) => {
    if (vistaComparativa) {
      // En vista comparativa, calcular stock total de todos los almacenes
      const calcularStockTotal = (producto) => {
        return Object.values(producto.almacenes || {}).reduce((total, alm) => {
          return total + alm.stock_disponible;
        }, 0);
      };
      const stockTotalA = calcularStockTotal(a);
      const stockTotalB = calcularStockTotal(b);

      if (sortOrder === "asc") return stockTotalA - stockTotalB;
      if (sortOrder === "desc") return stockTotalB - stockTotalA;
      return 0;
    } else {
      // Vista normal
      const stockDisponibleA =
        Number(a.stock_act || 0) - Number(a.stock_com || 0);
      const stockDisponibleB =
        Number(b.stock_act || 0) - Number(b.stock_com || 0);

      if (sortOrder === "asc") return stockDisponibleA - stockDisponibleB;
      if (sortOrder === "desc") return stockDisponibleB - stockDisponibleA;
      return 0;
    }
  });

  const toggleSortOrder = () => {
    setSortOrder((prev) => {
      if (prev === "") return "asc";
      if (prev === "asc") return "desc";
      return ""; // Volver a sin ordenamiento
    });
  };

  // Pagination
  const totalPages = Math.ceil(sortedProductos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sortedProductos.slice(startIndex, endIndex);

  useEffect(() => {
    const updateMirrorWidth = () => {
      if (!tableScrollContainerRef.current || !tableScrollMirrorRef.current)
        return;
      const tableElement =
        tableScrollContainerRef.current.querySelector("table");
      const width = tableElement
        ? tableElement.scrollWidth
        : tableScrollContainerRef.current.scrollWidth;
      tableScrollMirrorRef.current.style.width = `${width}px`;
    };

    updateMirrorWidth();

    let resizeObserver;
    let observedElement;

    if (
      typeof ResizeObserver !== "undefined" &&
      tableScrollContainerRef.current
    ) {
      observedElement =
        tableScrollContainerRef.current.querySelector("table") ||
        tableScrollContainerRef.current;
      resizeObserver = new ResizeObserver(() => updateMirrorWidth());
      resizeObserver.observe(observedElement);
    } else {
      window.addEventListener("resize", updateMirrorWidth);
    }

    return () => {
      if (resizeObserver && observedElement) {
        resizeObserver.unobserve(observedElement);
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", updateMirrorWidth);
      }
    };
  }, [
    vistaComparativa,
    sortedProductos.length,
    selectedAlmacenesComparar.length,
  ]);

  const handleTableScroll = (event) => {
    if (!tableScrollMirrorWrapperRef.current) return;
    tableScrollMirrorWrapperRef.current.scrollLeft = event.target.scrollLeft;
  };

  const handleMirrorScroll = (event) => {
    if (!tableScrollContainerRef.current) return;
    tableScrollContainerRef.current.scrollLeft = event.target.scrollLeft;
  };

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
  const articulosMap = useMemo(() => {
    if (!dataArticulos) return {};
    return dataArticulos.reduce((map, articulo) => {
      map[articulo.co_art.trim()] = articulo.art_des;
      return map;
    }, {});
  }, [dataArticulos]);

  const options = Object.keys(articulosMap || {}).map((co) => ({
    value: co,
    label: `${co} - ${articulosMap[co]}`,
  }));
  const categorias = [
    ...new Set(dataProductosAlmacenes.map((p) => p.categoria_principal)),
  ].sort();

  if (
    isLoading ||
    !dataProductosAlmacenes ||
    dataProductosAlmacenes.length === 0
  ) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-3">
      <div className="card border-0 shadow-sm overflow-hidden mb-3">
        <div
          className="p-4 d-flex align-items-center justify-content-between"
          style={{
            background: "linear-gradient(90deg, #6f42c1 0%, #b794f6 100%)",
          }}
        >
          <div className="d-flex align-items-center gap-3 text-white">
            <i className="bi bi-grid-3x3-gap"></i>
            <div>
              <h5 className="mb-0">Productos</h5>
              {!esAlmacenLogistica ? (
                <span className="badge bg-success mt-1">Solo APP VENTAS</span>
              ) : (
                <span className="badge bg-info mt-1">Todos los Productos</span>
              )}
            </div>
          </div>
          <small className="text-white-75">
            {esAlmacenLogistica
              ? "Vista Almacén/Logística"
              : "Vista Distribución"}
          </small>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-white d-flex align-items-center gap-2">
          <i className="bi bi-funnel text-primary"></i>
          <h6 className="mb-0">Filtros</h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Buscar</label>
              <div className="input-group" style={{ zIndex: "1000" }}>
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <Select
                  className="form-control"
                  options={options}
                  isClearable
                  isSearchable
                  placeholder="Seleccione"
                  onChange={(opt) => setSearchTerm(opt?.value || "")}
                />
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label">Categoría</label>
              <select
                className="form-control form-select"
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Estado</label>
              <select
                className="form-control form-select"
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="disponible">Disponible</option>
                <option value="bajo">Stock Bajo</option>
                <option value="sin-stock">Sin Stock</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Promedio Movimiento (meses)</label>
              <select
                className="form-control form-select"
                value={avgMonths}
                onChange={(e) => setAvgMonths(Number(e.target.value))}
              >
                <option value={1}>Último 1 mes</option>
                <option value={2}>Últimos 2 meses</option>
                <option value={3}>Últimos 3 meses</option>
                <option value={6}>Últimos 6 meses</option>
                <option value={12}>Últimos 12 meses</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Mes base</label>
              <input
                type="month"
                className="form-control"
                value={baseMonth}
                onChange={(e) => setBaseMonth(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Ordenar por Stock</label>
              <button
                type="button"
                className="btn btn-outline-primary w-100 p-2"
                onClick={toggleSortOrder}
                style={{ height: "3rem" }}
              >
                {sortOrder === ""
                  ? "Sin ordenar"
                  : sortOrder === "asc"
                    ? "Menor a Mayor "
                    : "Mayor a Menor "}
              </button>
            </div>
          </div>
          <div className="mt-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-geo-alt text-danger"></i>
                <span className="fw-semibold">Ubicación</span>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${vistaComparativa ? "btn-success" : "btn-outline-secondary"}`}
                onClick={() => setVistaComparativa(!vistaComparativa)}
                title="Cambiar a vista comparativa entre almacenes"
              >
                <i
                  className={`bi ${vistaComparativa ? "bi-table" : "bi-grid-3x3"}`}
                ></i>
                {vistaComparativa ? " Vista Comparativa" : " Vista Normal"}
              </button>
            </div>
            <div
              className=" d-flex  btn-group flex-wrap"
              role="group"
              aria-label="Filtros de ubicación"
            >
              <button
                type="button"
                className={`btn btn-outline-primary ${selectedLocation === "all" ? "active" : ""}`}
                onClick={() => setSelectedLocation("all")}
              >
                Todos
              </button>
              <button
                type="button"
                className={`btn btn-outline-primary ${selectedLocation === "7020" ? "active" : ""}`}
                onClick={() => setSelectedLocation("7020")}
              >
                Barquisimeto Principal
              </button>
              <button
                type="button"
                className={`btn btn-outline-primary ${selectedLocation === "8010" ? "active" : ""}`}
                onClick={() => setSelectedLocation("8010")}
              >
                Maracaibo Occidente
              </button>
              <button
                type="button"
                className={`btn btn-outline-primary ${selectedLocation === "8060" ? "active" : ""}`}
                onClick={() => setSelectedLocation("8060")}
              >
                Barcelona Oriente
              </button>
              <button
                type="button"
                className={`btn btn-outline-primary ${selectedLocation === "8070" ? "active" : ""}`}
                onClick={() => setSelectedLocation("8070")}
              >
                Santa Cruz Aragua
              </button>
              <button
                type="button"
                className={`btn btn-outline-primary ${selectedLocation === "8090" ? "active" : ""}`}
                onClick={() => setSelectedLocation("8090")}
              >
                Capital
              </button>
            </div>
          </div>

          {/* Selección de almacenes para comparar */}
          {vistaComparativa && (
            <div className="mt-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-arrow-left-right text-primary"></i>
                <span className="fw-semibold">Almacenes a Comparar</span>
                <small className="text-muted">
                  (Selecciona 2 o más para comparar)
                </small>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {almacenes.map((alm) => (
                  <div key={alm.co_alma} className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`alm-comp-${alm.co_alma}`}
                      checked={selectedAlmacenesComparar.includes(alm.co_alma)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAlmacenesComparar([
                            ...selectedAlmacenesComparar,
                            alm.co_alma,
                          ]);
                        } else {
                          setSelectedAlmacenesComparar(
                            selectedAlmacenesComparar.filter(
                              (co) => co !== alm.co_alma,
                            ),
                          );
                        }
                      }}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`alm-comp-${alm.co_alma}`}
                    >
                      {alm.nombre.split(" ")[0]}
                    </label>
                  </div>
                ))}
                {selectedAlmacenesComparar.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setSelectedAlmacenesComparar([])}
                  >
                    Limpiar selección
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Mostrando {startIndex + 1}-
            {Math.min(endIndex, filteredProductos.length)} de{" "}
            {filteredProductos.length} productos
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
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
                  <li
                    key={pageNum}
                    className={`page-item ${currentPage === pageNum ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  </li>
                );
              })}

              <li
                className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
      {/* Tabla de productos */}
      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-boxes"></i>
            {vistaComparativa
              ? "Vista Comparativa por Almacén"
              : "Listado de Productos"}
          </h6>
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-success btn-sm d-flex align-items-center gap-2"
              onClick={handleGuardarCuotas}
              title="Guardar todas las cuotas modificadas"
            >
              <i className="bi bi-save"></i>
              Guardar Cuotas
            </button>
            <small className="text-muted">
              Total filtrados: {sortedProductos.length}
            </small>
          </div>
        </div>
        <div className="card-body p-0">
          <div
            ref={tableScrollMirrorWrapperRef}
            onScroll={handleMirrorScroll}
            style={{
              overflowX: "auto",
              overflowY: "hidden",
              marginBottom: "0.5rem",
              maxWidth: "100%",
              height: "18px",
            }}
          >
            <div
              ref={tableScrollMirrorRef}
              style={{ height: "1px", pointerEvents: "none" }}
            />
          </div>
          <div
            className="table-responsive"
            ref={tableScrollContainerRef}
            onScroll={handleTableScroll}
            style={{
              maxHeight: vistaComparativa ? "70vh" : "none",
              overflowX: "auto",
            }}
          >
            <table
              className="table table-bordered align-middle mb-0"
              style={{
                borderCollapse: vistaComparativa ? "separate" : "collapse",
                borderSpacing: vistaComparativa ? "0" : "0",
              }}
            >
              <thead style={{ position: "sticky", top: 0, zIndex: 100 }}>
                {vistaComparativa ? (
                  <>
                    <tr style={{ backgroundColor: "#1565c0" }}>
                      <th
                        rowSpan="2"
                        style={{
                          verticalAlign: "middle",
                          color: "white",
                          backgroundColor: "#1565c0",
                          borderRight: "3px solid #0d47a1",
                          minWidth: "100px",
                          padding: "12px",
                        }}
                      >
                        Código
                      </th>
                      <th
                        rowSpan="2"
                        style={{
                          verticalAlign: "middle",
                          color: "white",
                          backgroundColor: "#1565c0",
                          borderRight: "3px solid #0d47a1",
                          minWidth: "250px",
                          padding: "12px",
                        }}
                      >
                        Descripción
                      </th>
                      <th
                        colSpan={almacenesAMostrar.length}
                        style={{
                          textAlign: "center",
                          color: "white",
                          backgroundColor: "#1565c0",
                          borderRight: "3px solid #0d47a1",
                          padding: "12px",
                        }}
                      >
                        ALMACENES - Stock Disponible
                      </th>
                      {selectedAlmacenesComparar.length > 0 &&
                        selectedAlmacenesComparar.length < almacenes.length && (
                          <th
                            rowSpan="2"
                            style={{
                              verticalAlign: "middle",
                              color: "white",
                              backgroundColor: "#00897b",
                              borderRight: "3px solid #0d47a1",
                              minWidth: "110px",
                              textAlign: "center",
                              padding: "12px",
                            }}
                          >
                            <div className="d-flex flex-column align-items-center">
                              <i
                                className="bi bi-calculator mb-1"
                                style={{ fontSize: "1rem" }}
                              ></i>
                              <span>Total Parcial</span>
                              <small
                                style={{ fontSize: "0.7rem", opacity: 0.8 }}
                              >
                                ({selectedAlmacenesComparar.length} alm.)
                              </small>
                            </div>
                          </th>
                        )}
                      <th
                        rowSpan="2"
                        style={{
                          verticalAlign: "middle",
                          color: "white",
                          backgroundColor: "#1565c0",
                          borderRight: "3px solid #0d47a1",
                          minWidth: "100px",
                          textAlign: "center",
                          padding: "12px",
                        }}
                      >
                        Total General
                      </th>
                      <th
                        colSpan="2"
                        style={{
                          textAlign: "center",
                          color: "white",
                          backgroundColor: "#1565c0",
                          borderRight: "3px solid #0d47a1",
                          padding: "12px",
                        }}
                      >
                        CUOTAS
                      </th>
                      <th
                        rowSpan="2"
                        style={{
                          verticalAlign: "middle",
                          color: "white",
                          backgroundColor: "#1565c0",
                          borderRight: "3px solid #0d47a1",
                          minWidth: "100px",
                          textAlign: "center",
                          padding: "12px",
                        }}
                      >
                        Promedio
                      </th>
                      <th
                        rowSpan="2"
                        style={{
                          verticalAlign: "middle",
                          color: "white",
                          backgroundColor: "#1565c0",
                          minWidth: "80px",
                          padding: "12px",
                        }}
                      >
                        Acciones
                      </th>
                    </tr>
                    <tr style={{ backgroundColor: "#64b5f6" }}>
                      {almacenesAMostrar.map((alm, idx) => (
                        <th
                          key={alm.co_alma}
                          style={{
                            backgroundColor:
                              almacenColors[alm.co_alma]?.bg || "#f5f5f5",
                            color: almacenColors[alm.co_alma]?.text || "#000",
                            borderLeft: `4px solid ${almacenColors[alm.co_alma]?.border || "#ccc"}`,
                            borderRight:
                              idx === almacenesAMostrar.length - 1
                                ? "3px solid #0d47a1"
                                : "1px solid #ddd",
                            borderTop: "1px solid #ddd",
                            minWidth: "150px",
                            padding: "12px 8px",
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "0.85rem",
                          }}
                        >
                          <div className="d-flex flex-column align-items-center">
                            <i
                              className="bi bi-building mb-1"
                              style={{ fontSize: "1.2rem" }}
                            ></i>
                            <span>{alm.nombre.split("(")[0].trim()}</span>
                            <small style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                              ({alm.co_alma})
                            </small>
                          </div>
                        </th>
                      ))}
                      <th
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#0d47a1",
                          fontWeight: "bold",
                          textAlign: "center",
                          fontSize: "0.8rem",
                          borderRight: "3px solid #0d47a1",
                          padding: "12px",
                          borderTop: "1px solid #ddd",
                          border: "2px solid #64b5f6",
                        }}
                      >
                        Solicitada
                      </th>
                      <th
                        style={{
                          backgroundColor: "#e0f2f1",
                          color: "#004d40",
                          fontWeight: "bold",
                          textAlign: "center",
                          fontSize: "0.8rem",
                          borderRight: "3px solid #0d47a1",
                          padding: "12px",
                          borderTop: "1px solid #ddd",
                          border: "2px solid #4db6ac",
                        }}
                      >
                        Enviada
                      </th>
                    </tr>
                  </>
                ) : (
                  <tr className="bg-light">
                    {columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {currentProducts.map((producto, rowIdx) => {
                  const rowBackground =
                    rowIdx % 2 === 0 ? "#ffffff" : "#f8f9fa";

                  if (vistaComparativa) {
                    const keysForTotals = almacenesAMostrar
                      .map((alm) => buildQuotaKey(producto.co_art, alm.co_alma))
                      .filter(Boolean);

                    const totalSolicitada = keysForTotals.reduce(
                      (acc, key) => acc + Number(cuotaSolicitada[key] || 0),
                      0,
                    );
                    const totalEnviada = keysForTotals.reduce(
                      (acc, key) => acc + Number(cuotaEnviada[key] || 0),
                      0,
                    );
                    const totalPendiente = Math.max(
                      0,
                      totalSolicitada - totalEnviada,
                    );
                    const totalIncrementoPendiente = keysForTotals.reduce(
                      (acc, key) => acc + Number(cuotaEnvioPendiente[key] || 0),
                      0,
                    );
                    const totalPorcentaje =
                      totalSolicitada > 0
                        ? Math.min(
                            100,
                            Math.round((totalEnviada / totalSolicitada) * 100),
                          )
                        : 0;

                    return (
                      <tr
                        key={producto.co_art}
                        style={{ backgroundColor: rowBackground }}
                      >
                        <td
                          style={{
                            borderRight: "3px solid #dee2e6",
                            fontWeight: "bold",
                            backgroundColor: rowBackground,
                          }}
                        >
                          <span className="badge bg-dark">
                            {producto.co_art}
                          </span>
                        </td>
                        <td
                          style={{
                            borderRight: "3px solid #dee2e6",
                            backgroundColor: rowBackground,
                          }}
                        >
                          <div style={{ minWidth: "200px", maxWidth: "300px" }}>
                            <strong>{producto.art_des}</strong>
                            {producto.categoria_principal && (
                              <div className="mt-1">
                                <span
                                  className="badge bg-secondary"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  {producto.categoria_principal}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        {almacenesAMostrar.map((alm, idx) => {
                          const quotaKey = buildQuotaKey(
                            producto.co_art,
                            alm.co_alma,
                          );
                          const almData = producto.almacenes?.[alm.co_alma];
                          const solicitada = Number(
                            cuotaSolicitada[quotaKey] || 0,
                          );
                          const enviada = Number(cuotaEnviada[quotaKey] || 0);
                          const pendienteEnvio = Number(
                            cuotaEnvioPendiente[quotaKey] || 0,
                          );
                          const restante = Math.max(0, solicitada - enviada);
                          const historialLocal = cuotaHistorial[quotaKey] || [];
                          const ultimoEnvio =
                            historialLocal.length > 0
                              ? formatShortDateTime(
                                  historialLocal[0]?.fecha_envio,
                                )
                              : null;

                          if (!almData) {
                            return (
                              <td
                                key={alm.co_alma}
                                style={{
                                  backgroundColor:
                                    almacenColors[alm.co_alma]?.bg || "#f5f5f5",
                                  borderLeft: `4px solid ${almacenColors[alm.co_alma]?.border || "#ccc"}`,
                                  borderRight:
                                    idx === almacenesAMostrar.length - 1
                                      ? "3px solid #dee2e6"
                                      : "1px solid #ddd",
                                  textAlign: "center",
                                  padding: "12px 8px",
                                }}
                              >
                                <div
                                  className="text-muted"
                                  style={compactMetricStyle}
                                >
                                  —
                                </div>
                              </td>
                            );
                          }

                          const disponible = Number(
                            almData?.stock_disponible || 0,
                          );
                          const stockMin =
                            getStockMinimo(producto?.co_art?.trim()) || 0;

                          let estadoClass = "bg-success text-white";
                          let estadoLabel = "Disponible";
                          if (disponible === 0) {
                            estadoClass = "bg-danger text-white";
                            estadoLabel = "Sin stock";
                          } else if (stockMin > 0 && disponible <= stockMin) {
                            estadoClass = "bg-warning text-dark";
                            estadoLabel = "Stock bajo";
                          }

                          return (
                            <td
                              key={alm.co_alma}
                              style={{
                                backgroundColor:
                                  almacenColors[alm.co_alma]?.bg || "#f5f5f5",
                                borderLeft: `4px solid ${almacenColors[alm.co_alma]?.border || "#ccc"}`,
                                borderRight:
                                  idx === almacenesAMostrar.length - 1
                                    ? "3px solid #dee2e6"
                                    : "1px solid #ddd",
                                textAlign: "center",
                                padding: "12px 8px",
                              }}
                            >
                              <div
                                className="d-flex flex-column gap-2"
                                style={compactMetricStyle}
                              >
                                <div className="d-flex flex-column align-items-center">
                                  <span
                                    className="fw-bold text-primary"
                                    style={{
                                      fontSize: "1.1rem",
                                      lineHeight: 1.1,
                                    }}
                                  >
                                    {formatNumber(disponible)}
                                  </span>
                                  <span
                                    className={`badge rounded-pill ${estadoClass}`}
                                    style={{
                                      ...compactBadgeStyle,
                                      fontSize: "0.75rem",
                                      padding: "0.3rem 0.7rem",
                                    }}
                                  >
                                    {estadoLabel}
                                  </span>
                                </div>
                                <div className="text-muted">
                                  Enviado / Meta:&nbsp;
                                  <span className="fw-semibold text-dark">
                                    {formatNumber(enviada)}
                                  </span>
                                  &nbsp;/ {formatNumber(solicitada || 0)}
                                </div>
                                {restante > 0 && (
                                  <div
                                    className="text-warning"
                                    style={{ fontSize: "0.7rem" }}
                                  >
                                    Pendiente: {formatNumber(restante)}
                                  </div>
                                )}
                                {pendienteEnvio > 0 && (
                                  <div
                                    className="text-muted"
                                    style={{ fontSize: "0.7rem" }}
                                  >
                                    Próx. envío programado: +
                                    {formatNumber(pendienteEnvio)}
                                  </div>
                                )}
                                {ultimoEnvio && (
                                  <div
                                    className="text-muted"
                                    style={{ fontSize: "0.7rem" }}
                                  >
                                    Último envío: {ultimoEnvio}
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                        {selectedAlmacenesComparar.length > 0 &&
                          selectedAlmacenesComparar.length <
                            almacenes.length && (
                            <td
                              style={{
                                textAlign: "center",
                                borderRight: "3px solid #dee2e6",
                                backgroundColor: "#e0f7fa",
                              }}
                            >
                              <div
                                className="text-center"
                                style={compactMetricStyle}
                              >
                                <div className="fw-semibold text-info">
                                  {formatNumber(
                                    almacenesAMostrar.reduce((sum, alm) => {
                                      const almData =
                                        producto.almacenes?.[alm.co_alma];
                                      return (
                                        sum + (almData?.stock_disponible || 0)
                                      );
                                    }, 0),
                                  )}
                                </div>
                                <div className="text-muted">Seleccionados</div>
                              </div>
                            </td>
                          )}
                        <td
                          style={{
                            textAlign: "center",
                            borderRight: "3px solid #dee2e6",
                            backgroundColor: "#e8f5e9",
                          }}
                        >
                          <div
                            className="text-center"
                            style={compactMetricStyle}
                          >
                            <div className="fw-semibold text-primary">
                              {formatNumber(
                                Object.values(producto.almacenes || {}).reduce(
                                  (sum, alm) => sum + alm.stock_disponible,
                                  0,
                                ),
                              )}
                            </div>
                            <div className="text-muted">Total general</div>
                          </div>
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            backgroundColor: "#f1f8f4",
                            borderRight: "1px solid #ddd",
                          }}
                        >
                          <div
                            className="text-center"
                            style={compactMetricStyle}
                          >
                            <div className="fw-semibold">
                              {formatNumber(totalSolicitada)}
                            </div>
                            <div className="text-muted">Meta mensual</div>
                            {totalPendiente > 0 && (
                              <div
                                className="text-warning"
                                style={{ fontSize: "0.7rem" }}
                              >
                                Pendiente: {formatNumber(totalPendiente)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            backgroundColor: "#f0f7ff",
                            borderRight: "3px solid #dee2e6",
                          }}
                        >
                          <div
                            className="text-center"
                            style={compactMetricStyle}
                          >
                            <div className="fw-semibold text-dark">
                              {formatNumber(totalEnviada)} /{" "}
                              {formatNumber(totalSolicitada || 0)}
                            </div>
                            <div className="text-muted">
                              {totalSolicitada > 0
                                ? `${totalPorcentaje}% enviado`
                                : "Sin meta"}
                            </div>
                            {totalIncrementoPendiente > 0 && (
                              <div
                                className="text-muted"
                                style={{ fontSize: "0.7rem" }}
                              >
                                Próx. envío: +
                                {formatNumber(totalIncrementoPendiente)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            borderRight: "3px solid #dee2e6",
                          }}
                        >
                          <span
                            className="badge bg-info"
                            style={{ fontSize: "0.8rem" }}
                          >
                            {formatNumber(getPromedioMensual(producto) || 0)}{" "}
                            un/mes
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            title="Ver Observaciones"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => {
                              const match = dataStockMinimo.find(
                                (item) => item.co_art === producto.co_art,
                              );
                              if (match) {
                                setObservacion(match);
                              } else {
                                setObservacion(producto);
                              }
                              handleShowModalObservacion();
                            }}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={`${producto.co_art}-${producto.co_alma || "all"}`}
                      style={{ backgroundColor: rowBackground }}
                    >
                      {columns.map((column) => (
                        <td key={column.key}>
                          {column.render
                            ? column.render(producto[column.key], producto)
                            : producto[column.key]}
                        </td>
                      ))}
                      <td>
                        {(() => {
                          const stockDisponible =
                            (producto.stock_act || 0) -
                            (producto.stock_com || 0);
                          const stockMinimoReal =
                            getStockMinimo(producto.co_art) ||
                            producto.stock_minimo ||
                            0;
                          return (
                            <span
                              className={`badge ${
                                stockDisponible === 0
                                  ? "bg-danger"
                                  : stockMinimoReal > 0 &&
                                      stockDisponible <= stockMinimoReal
                                    ? "bg-warning"
                                    : "bg-success"
                              }`}
                            >
                              {stockDisponible === 0
                                ? "Sin Stock"
                                : stockMinimoReal > 0 &&
                                    stockDisponible <= stockMinimoReal
                                  ? "Stock Bajo"
                                  : "Disponible"}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="d-flex flex-row">
                        {esAlmacenLogistica && (
                          <button
                            title="Cambiar Stock Minimo"
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => handleEdit(producto)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                        )}
                        <button
                          title="Ver Observaciones"
                          className="btn btn-sm btn-outline-secondary me-1"
                          onClick={() => {
                            const match = dataStockMinimo.find(
                              (item) => item.co_art === producto.co_art,
                            );
                            if (match) {
                              setObservacion(match);
                            } else {
                              setObservacion(producto);
                            }
                            handleShowModalObservacion();
                          }}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {currentProducts.length === 0 && (
              <div className="text-center py-4">
                <p className="text-muted">
                  No se encontraron productos con los filtros aplicados
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="text-muted">
            Mostrando {startIndex + 1}-
            {Math.min(endIndex, filteredProductos.length)} de{" "}
            {filteredProductos.length} productos
          </div>
          <nav>
            <ul className="pagination mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
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
                  <li
                    key={pageNum}
                    className={`page-item ${currentPage === pageNum ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  </li>
                );
              })}

              <li
                className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
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
        title={
          editingItem
            ? `Editar Producto: ${editingItem.art_des}`
            : "Nuevo Producto"
        }
        fields={editingItem ? editFormFields : formFields}
        initialData={editingItem}
      />
      <ModalObservacion
        show={showModalObservacion}
        onClose={handleShowModalObservacion}
        data={observacion}
      />
    </div>
  );
};

export default Productos;
