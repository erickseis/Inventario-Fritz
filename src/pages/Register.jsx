import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Auth.css";
import {  registro } from "../service/authSesion";
import {obtenerCargos, obtenerDepartamentos, obtenerVendedores,} from "../service/connection"


const Register = () => {
  const [formData, setFormData] = useState({
    usuario: "",
    codigo_vendedor: "",
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    ciudad: "",
    departamento: "",
    rol: "",
    cargo: "",
    contrasenha: "",
    confirmar_contrasenha: "",
  });

  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [vendedores, setVendedores] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [departamentos, setDepartamentos] = useState([])

  const fetchVendedores = async () => {
    try {
      const response = await obtenerVendedores();
      setVendedores(response);
    } catch (error) {
      console.error("Error al obtener vendedores:", error);
    }
  };

  const fetchCargos = async () => {
    try {
      const response = await obtenerCargos();
      setCargos(response);
    } catch (error) {
      console.error("Error al obtener cargos:", error);
    }
  };

  const fetchDepartamentos = async () => {
    try {
      const response = await obtenerDepartamentos();
      setDepartamentos(response);
    } catch (error) {
      console.error("Error al obtener departamentos:", error);
    }
  };

  useEffect(() => {
    fetchVendedores();
    fetchCargos();
    fetchDepartamentos();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validaciones
    if (formData.contrasenha !== formData.confirmar_contrasenha) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (formData.contrasenha.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }
    console.log("Registrando usuario1:", {
      usuario: formData.usuario,
      codigo_vendedor: formData.codigo_vendedor,
      nombre: formData.nombre,
      apellido: formData.apellido,
      correo: formData.correo,
      telefono: formData.telefono,
      ciudad: formData.ciudad,
      departamento: formData.departamento,
      rol: formData.rol,
      cargo: formData.cargo,
    });
    try {
      // Aquí iría la lógica para registrar al usuario con tu backend
      // Por ahora simularemos un registro exitoso
      const userRegistro = await registro(formData);
      if (userRegistro) {
        // Simulación de registro
        console.log("Registrando usuario2 enviado:", {
          usuario: formData.usuario,
          codigo_vendedor: formData.codigo_vendedor,
          nombre: formData.nombre,
          apellido: formData.apellido,
          correo: formData.correo,
          telefono: formData.telefono,
          ciudad: formData.ciudad,
          departamento: formData.departamento,
          rol: formData.rol,
          cargo: formData.cargo,
        });

        // Mostrar mensaje de éxito y redirigir al login
        alert("¡Registro exitoso! Por favor inicia sesión.");
        navigate("/login");
      }
    } catch (error) {
      setError("Error al registrar el usuario. Por favor intenta de nuevo.");
      console.error("Error de registro:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center px-3 py-4">
        <div className="row w-100">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 mx-auto">
            <div className="card auth-card">
              <div className="card-body p-4 p-sm-5">
                <div className="text-center mb-4">
                  <div className="d-flex justify-content-center mb-3">
                    <div
                      className="d-flex justify-content-center align-items-center bg-primary bg-opacity-10 rounded-circle"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <i className="bi bi-person-plus fs-1 text-primary"></i>
                    </div>
                  </div>
                  <h2 className="h3 mb-1 fw-bold">Crear Cuenta</h2>
                  <p className="text-muted mb-0">Únete a Inventario Fritz</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="usuario" className="form-label">
                      <i className="bi bi-person me-2"></i>Usuario
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="usuario"
                      name="usuario"
                      value={formData.usuario}
                      onChange={handleChange}
                      required
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      <i className="bi bi-person me-2"></i>Nombre
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Juan"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      <i className="bi bi-person me-2"></i> Apellido
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="apellido"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      required
                      placeholder="Pérez"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <i className="bi bi-envelope me-2"></i>Correo Electrónico
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="correo"
                      name="correo"
                      value={formData.correo}
                      onChange={handleChange}
                      required
                      placeholder="ejemplo@correo.com"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">
                      <i className="bi bi-telephone me-2"></i>Teléfono
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">
                      <i className="bi bi-telephone me-2"></i>Ciudad
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      id="ciudad"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleChange}
                      placeholder="Ciudad"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="departamento" className="form-label">
                      <i className="bi bi-geo-alt me-2"></i>Departamento
                    </label>
                    <select
                      className="form-select custom-select"
                      id="departamento"
                      name="departamento"
                      value={formData.departamento}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecciona un departamento</option>
                      {departamentos.filter((item)=> item.deleted === false).map((departamento) => (
                        <option key={departamento.id} value={departamento.id}>
                          {departamento.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formData.departamento === "16" ? (
                    <div className="mb-3">
                      <label htmlFor="codigo_vendedor" className="form-label">
                        <i className="bi bi-person-badge me-2"></i>Código
                        Vendedor
                      </label>
                      <select
                        className="form-select custom-select"
                        id="codigo_vendedor"
                        name="codigo_vendedor"
                        value={formData.codigo_vendedor}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecciona un código</option>
                        {vendedores.map((vendedor) => (
                          <option key={vendedor.co_ven} value={vendedor.co_ven}>
                            {vendedor.co_ven} - {vendedor.ven_des}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

               
                  <div className="mb-3">
                    <label htmlFor="cargo" className="form-label">
                      <i className="bi bi-briefcase me-2"></i>Cargo
                    </label>
                    <select
                      className="form-select custom-select"
                      id="cargo"
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleChange}
                      required
                    >
                      {formData.departamento ? cargos.filter((item)=> Number(item.departamento_id) === Number(formData.departamento)).map((cargo) => {
                        formData.rol = cargo.rol_id
                        return(
                        <option key={cargo.id} value={cargo.id}>
                          {cargo.nombre_cargo}
                        </option>
                        )
                      }) : <option value="">Selecciona un cargo</option>}
                      
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      <i className="bi bi-lock me-2"></i>Contraseña
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="contrasenha"
                      name="contrasenha"
                      value={formData.contrasenha}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">
                      <i className="bi bi-lock me-2"></i>Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmContrasenha"
                      name="confirmar_contrasenha"
                      value={formData.confirmar_contrasenha}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="d-grid mb-3">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                          ></span>
                          Registrando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus me-2"></i>
                          Registrarse
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="mb-0">
                      ¿Ya tienes una cuenta?{" "}
                      <Link
                        to="/login"
                        className="text-primary text-decoration-none"
                      >
                        Inicia sesión aquí
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
