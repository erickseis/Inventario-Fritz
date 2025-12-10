import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Auth.css";
import { login } from "../service/authSesion";
import { obtenerUsuarioLogueado } from "../service/connection";

const Login = () => {
  const [formData, setFormData] = useState({
    usuario: "",
    contrasenha: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

    try {
      // Aquí iría la lógica de autenticación con tu backend
      // Por ahora simularemos un login exitoso
      const response = await login(formData);
      console.log("respuesta inicio", response);
      if (response?.userId) {
        // El login de authSesion ya guarda el usuario correctamente

        // Obtener datos completos del usuario incluyendo el rol
        try {
          const userData = await obtenerUsuarioLogueado(response.userId);
          console.log("Datos usuario login:", userData);

          // Determinar rol del usuario
          const roleValue = userData?.rol ?? userData?.cargo;
          const numericRole = roleValue != null ? Number(roleValue) : undefined;

          // Redirigir según el rol
          if (numericRole === 3) {
            navigate("/inventario");
          } else {
            navigate("/");
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
          // Fallback: redirigir a dashboard si hay error
          navigate("/");
        }
      } else {
        setError("Credenciales inválidas. Por favor intenta de nuevo.");
      }
    } catch (error) {
      setError("Error al iniciar sesión. Por favor intenta de nuevo.");
      console.error("Error de login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center px-3 py-4">
        <div className="row w-100">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4 mx-auto">
            <div className="card auth-card">
              <div className="card-body p-4 p-sm-5">
                <div className="text-center mb-4">
                  <div className="d-flex justify-content-center mb-3">
                    <div
                      className="d-flex justify-content-center align-items-center bg-primary bg-opacity-10 rounded-circle"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <i className="bi bi-box-seam fs-1 text-primary"></i>
                    </div>
                  </div>
                  <h2 className="h3 mb-1 fw-bold">Inventario Fritz</h2>
                  <p className="text-muted mb-0">Inicia sesión en tu cuenta</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="usuario" className="form-label">
                      <i className="bi bi-envelope me-2"></i>Usuario
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="usuario"
                      name="usuario"
                      value={formData.usuario}
                      onChange={handleChange}
                      required
                      placeholder="usuario"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="contrasenha" className="form-label">
                      <i className="bi bi-lock me-2"></i>Contraseña
                    </label>
                    <input
                      type="contrasenha"
                      className="form-control"
                      id="contrasenha"
                      name="contrasenha"
                      value={formData.contrasenha}
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
                          Iniciando sesión...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Iniciar Sesión
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="mb-0">
                      ¿No tienes una cuenta?{" "}
                      <Link
                        to="/register"
                        className="text-primary text-decoration-none"
                      >
                        Regístrate aquí
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

export default Login;
