import React, { useMemo, useState } from 'react';
import { useUser } from '../hooks/useUser';

const Configuracion = () => {
  const { user, loading } = useUser();
  const u = useMemo(() => (Array.isArray(user) ? user[0] : user) || {}, [user]);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: '',
    username: '',
    nombre: '',
    apellido: '',
    telefono: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });

  const openModal = () => {
    setForm({
      email: u?.email || '',
      username: u?.username || u?.usuario || '',
      nombre: u?.nombre || '',
      apellido: u?.apellido || '',
      telefono: u?.telefono || u?.phone || '',
      password: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSaving(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    // Validaciones mínimas
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      alert('La nueva contraseña y su confirmación no coinciden.');
      return;
    }
    try {
      setSaving(true);
      // TODO: Llamar API para actualizar perfil/credenciales.
      // Ejemplos:
      // await actualizarPerfil({ email: form.email, username: form.username, nombre: form.nombre, apellido: form.apellido, telefono: form.telefono });
      // if (form.newPassword) await cambiarContrasena({ actual: form.password, nueva: form.newPassword });
      console.log('Actualizar perfil', form);
      alert('Cambios guardados (simulado). Integraremos API real.');
      closeModal();
    } catch (err) {
      console.error('Error al guardar configuración', err);
      alert('Hubo un error al guardar.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-3">
      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="p-4 d-flex align-items-center justify-content-between" style={{background: 'linear-gradient(90deg, #0d6efd 0%, #6ea8fe 100%)'}}>
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle bg-white d-flex align-items-center justify-content-center" style={{width: 64, height: 64}}>
              <span className="fw-bold" style={{color:'#0d6efd'}}>
                {(u?.nombre?.[0] || '?').toUpperCase()}{(u?.apellido?.[0] || '').toUpperCase()}
              </span>
            </div>
            <div className="text-white">
              <h5 className="mb-0">{[u?.nombre, u?.apellido].filter(Boolean).join(' ') || 'Usuario'}</h5>
              <small className="opacity-75">{u?.username || u?.usuario || u?.email || '—'}</small>
            </div>
          </div>
          <button className="btn btn-light" onClick={openModal}>
            <i className="bi bi-pencil-square me-1"></i> Editar perfil
          </button>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-lg-4">
              <div className="p-3 border rounded-3 h-100">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-person-badge me-2 text-primary"></i>
                  <h6 className="mb-0">Datos personales</h6>
                </div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item px-0 d-flex justify-content-between"><span className="text-muted">Nombre</span><span className="fw-semibold">{u?.nombre || '—'}</span></li>
                  <li className="list-group-item px-0 d-flex justify-content-between"><span className="text-muted">Apellido</span><span className="fw-semibold">{u?.apellido || '—'}</span></li>
                  <li className="list-group-item px-0 d-flex justify-content-between"><span className="text-muted">Usuario</span><span className="fw-semibold">{u?.username || u?.usuario || '—'}</span></li>
                </ul>
              </div>
            </div>
            <div className="col-12 col-lg-4">
              <div className="p-3 border rounded-3 h-100">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-envelope-at me-2 text-primary"></i>
                  <h6 className="mb-0">Contacto</h6>
                </div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item px-0 d-flex justify-content-between"><span className="text-muted">Correo</span><span className="fw-semibold">{u?.email || '—'}</span></li>
                  <li className="list-group-item px-0 d-flex justify-content-between"><span className="text-muted">Teléfono</span><span className="fw-semibold">{u?.telefono || u?.phone || '—'}</span></li>
                </ul>
              </div>
            </div>
            <div className="col-12 col-lg-4">
              <div className="p-3 border rounded-3 h-100">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-shield-lock me-2 text-primary"></i>
                  <h6 className="mb-0">Acceso</h6>
                </div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item px-0 d-flex justify-content-between"><span className="text-muted">Rol</span><span className="badge bg-secondary">{u?.rol ?? u?.cargo ?? '—'}</span></li>
                  <li className="list-group-item px-0 d-flex justify-content-between"><span className="text-muted">Estado</span><span className="badge bg-success">Activo</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header bg-light">
                  <h5 className="modal-title"><i className="bi bi-gear-wide-connected me-2 text-primary"></i>Editar perfil</h5>
                  <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label">Nombre</label>
                      <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Apellido</label>
                      <input name="apellido" className="form-control" value={form.apellido} onChange={handleChange} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Usuario</label>
                      <input name="username" className="form-control" value={form.username} onChange={handleChange} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Correo</label>
                      <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Teléfono</label>
                      <input name="telefono" className="form-control" value={form.telefono} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                      <hr />
                      <h6 className="mb-2"><i className="bi bi-shield-lock me-2 text-primary"></i>Cambiar contraseña</h6>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Contraseña actual</label>
                      <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Nueva contraseña</label>
                      <input type="password" name="newPassword" className="form-control" value={form.newPassword} onChange={handleChange} />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label">Confirmar nueva contraseña</label>
                      <input type="password" name="confirmPassword" className="form-control" value={form.confirmPassword} onChange={handleChange} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={closeModal} disabled={saving}>Cancelar</button>
                  <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle me-1"></i> Guardar cambios
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default Configuracion;
