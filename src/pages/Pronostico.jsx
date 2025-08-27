import React from 'react';

const Pronostico = () => {
  // Usamos el alias /st que reescribe a /pronostico en el servidor de Streamlit
  const streamlitURL = '/st/';

  return (
    <div className="container-fluid p-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">Pronóstico de Ventas</h3>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0" style={{ height: 'calc(100vh - 180px)' }}>
          {/* Iframe embebiendo la app de Streamlit */}
          <iframe
            title="Pronóstico de Ventas"
            src={streamlitURL}
            style={{ border: '0', width: '100%', height: '100%' }}
            allow="clipboard-read; clipboard-write;"
          />
        </div>
      </div>

      <div className="text-muted small mt-2">
        Si el panel no carga, asegúrate de tener ejecutándose la app de Streamlit con baseUrlPath:
        <code className="ms-1">streamlit run app.py --server.port 8501 --server.enableCORS false --server.enableXsrfProtection false --server.baseUrlPath /pronostico</code>
      </div>
    </div>
  );
};

export default Pronostico;
