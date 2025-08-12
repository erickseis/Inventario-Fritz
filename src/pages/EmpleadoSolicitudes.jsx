import React from 'react';
import SolicitudRequerimientoForm from '../components/SolicitudRequerimientoForm';

const EmpleadoSolicitudes = () => {
  return (
    <div className="container py-3">
      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">Nueva Solicitud de Requerimiento</h5>
        </div>
        <div className="card-body">
          <SolicitudRequerimientoForm />
        </div>
      </div>
    </div>
  );
};

export default EmpleadoSolicitudes;
