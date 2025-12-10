import { useEffect, useState } from "react";
import { useUser } from "../hooks/useUser";
import {
  crearRequerimiento,
  obtenerInventario,
  obtenerVendedores,
} from "../service/connection";

const SolicitudRequerimientoForm = ({ fetchRequerimientos }) => {
  const { user } = useUser();
  const u = Array.isArray(user) ? user[0] : user;
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vendedores, setVendedores] = useState([]);
  const [form, setForm] = useState({
    codigo_vendedor: String(u?.codigo_vendedor) || "",
    sku_producto: "",
    cantidad_solicitada: "",
    fecha_solicitud: "",
    comentario: "",
  });

  //   const [promedio, setPromedio] = useState(null);
  //   const [checkingPromedio, setCheckingPromedio] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Cargar inventario para selector de SKU
  const cargarInventario = async () => {
    try {
      const data = await obtenerInventario();
      setInventario(data);
    } catch (err) {
      console.error("Inventario error:", err);
      setError("No se pudo cargar inventario");
    } finally {
      setLoading(false);
    }
  };
  //vendedores
  const cargarVendedores = async () => {
    try {
      const data = await obtenerVendedores();
      setVendedores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Vendedores error:", err);
      setError("No se pudo cargar vendedores");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    cargarInventario();
    cargarVendedores();
  }, []);
  // Inicializar vendedor y fecha/hora
  useEffect(() => {
    const now = new Date();
    const fecha = now.toISOString().slice(0, 10);
    const hora = now.toTimeString().slice(0, 8);
    setForm((prev) => ({
      ...prev,
      codigo_vendedor: String(u?.codigo_vendedor) || "",
      fecha,
      hora,
    }));
  }, [u, vendedores]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "sku_producto") {
      // limpiar promedio al cambiar SKU
      //   setPromedio(null);
    }
  };

  const validar = () => {
    if (!form.codigo_vendedor) return "El vendedor es requerido";
    if (!form.sku_producto) return "El SKU es requerido";
    if (!form.cantidad_solicitada || Number(form.cantidad_solicitada) <= 0)
      return "Cantidad inválida";
    return "";
  };

  //   const verificarPromedio = async () => {
  //     if (!form.sku) return;
  //     try {
  //       setCheckingPromedio(true);
  //       const data = await obtenerPromedioVentasSKU(form.sku);
  //       // Esperamos un número. Si no hay endpoint, podría ser null.
  //       const prom = typeof data === 'number' ? data : Number(data?.promedio || 0) || null;
  //       setPromedio(prom);
  //       if (prom && Number(form.cantidad) > prom) {
  //         setForm((p) => ({ ...p, requiereAprobacion: true }));
  //       }
  //     } catch (err) {
  //       console.error('Promedio error:', err);
  //       setPromedio(null);
  //     } finally {
  //       setCheckingPromedio(false);
  //     }
  //   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const msg = validar();
    if (msg) {
      setError(msg);
      return;
    }

    const payload = {
      codigo_vendedor: u?.codigo_vendedor,
      sku_producto: form.sku_producto.trim(),
      cantidad_solicitada: Number(form.cantidad_solicitada),
      fecha_solicitud: form.fecha_solicitud,
      comentario: form.comentario || "",
    };

    try {
      await crearRequerimiento(payload);
      // Si el backend responde OK
      setSuccessMsg("Solicitud registrada correctamente");
      // limpiar cantidad y comentario
      setForm((p) => ({
        ...p,
        sku_producto: "",
        cantidad_solicitada: "",
        comentario: "",
      }));
      fetchRequerimientos();
    } catch (err) {
      console.error("Crear requerimiento error:", err);
      setError("No se pudo registrar la solicitud");
    }
  };
  console.log("vendedores", vendedores);
  console.log("inventario", inventario);
  console.log("user", u);
  console.log("form", form);
  if (!u || !inventario || !vendedores) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success" role="alert">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Vendedor (quien solicita)</label>
            <input
              type="text"
              className="form-control"
              name="codigo_vendedor"
              value={
                vendedores.find(
                  (v) => String(v.co_ven) === String(u?.codigo_vendedor),
                )?.ven_des || ""
              }
              required
              readOnly
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">SKU</label>
            <select
              className="form-select"
              name="sku_producto"
              value={form.sku_producto}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Seleccione un SKU</option>
              {inventario?.map((opt) => (
                <option
                  key={`${opt.co_art} - ${opt.co_alma}`}
                  value={opt.co_art}
                >
                  {opt.art_des}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Cantidad</label>
            <input
              type="number"
              className="form-control"
              name="cantidad_solicitada"
              value={form.cantidad_solicitada}
              onChange={handleChange}
              min={1}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Fecha</label>
            <input
              type="date"
              className="form-control"
              name="fecha_solicitud"
              value={form.fecha_solicitud}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* <div className="col-12 d-flex align-items-center gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={verificarPromedio} disabled={!form.sku || checkingPromedio}>
              {checkingPromedio ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Consultando promedio...
                </>
              ) : (
                <>
                  <i className="bi bi-graph-up me-2" /> Ver promedio de ventas
                </>
              )}
            </button>
            {promedio !== null && (
              <span className="badge bg-info text-dark">Promedio histórico: {promedio}</span>
            )}
          </div>

          {(promedio !== null && Number(form.cantidad) > promedio) && (
            <div className="col-12">
              <div className="alert alert-warning mb-0">
                La cantidad solicitada supera el promedio de ventas. Se requerirá aprobación.
              </div>
            </div>
          )} */}

        <div className="col-12">
          <label className="form-label">Comentario (opcional)</label>
          <textarea
            className="form-control"
            name="comentario"
            rows={3}
            value={form.comentario}
            onChange={handleChange}
            placeholder="Detalle adicional o motivo"
          ></textarea>
        </div>

        <div className="col-12 d-grid d-sm-flex gap-2">
          <button type="submit" className="btn btn-primary">
            <i className="bi bi-send me-2" /> Registrar solicitud
          </button>
        </div>
      </form>
    </div>
  );
};

export default SolicitudRequerimientoForm;
