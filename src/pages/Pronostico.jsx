import React from 'react';

const Pronostico = () => {
  return (
    <div >
      <iframe
        // src="//172.24.0.125:9888"
        src="https://bnxvb1rj-9888.use2.devtunnels.ms/"
        width="100%"
        height="800px"
        title="Streamlit App"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default Pronostico;

// import React, { useState } from 'react';

// const Pronostico = () => {
//   const [hasError, setHasError] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   // URL a través del proxy de IIS
//   const iframeUrl = '/pronostico/';

//   const handleIframeError = () => {
//     setHasError(true);
//     setIsLoading(false);
//     console.error('Error al cargar la aplicación de pronóstico');
//   };

//   const handleIframeLoad = () => {
//     setIsLoading(false);
//     setHasError(false);
//   };

//   return (
//     <div style={{ position: 'relative', width: '100%', minHeight: '800px' }}>
//       {isLoading && (
//         <div style={{
//           position: 'absolute',
//           top: '50%',
//           left: '50%',
//           transform: 'translate(-50%, -50%)',
//           textAlign: 'center',
//           zIndex: 10,
//           backgroundColor: 'rgba(255, 255, 255, 0.9)',
//           padding: '20px',
//           borderRadius: '8px',
//           boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
//         }}>
//           <div style={{ 
//             width: '40px', 
//             height: '40px', 
//             border: '4px solid #f3f3f3', 
//             borderTop: '4px solid #3498db', 
//             borderRadius: '50%', 
//             animation: 'spin 1s linear infinite',
//             margin: '0 auto 15px auto'
//           }}></div>
//           <p>Cargando aplicación de pronóstico...</p>
//         </div>
//       )}
      
//       {hasError ? (
//         <div style={{
//           padding: '40px',
//           textAlign: 'center',
//           backgroundColor: '#fff3f3',
//           border: '1px solid #ffcdd2',
//           borderRadius: '8px',
//           margin: '20px'
//         }}>
//           <h3 style={{ color: '#d32f2f', marginBottom: '15px' }}>Error de conexión</h3>
//           <p>No se pudo cargar la aplicación de pronóstico.</p>
//           <p>Por favor, verifique que el servidor de pronóstico esté disponible.</p>
//           <button 
//             onClick={() => window.location.reload()} 
//             style={{
//               backgroundColor: '#3498db',
//               color: 'white',
//               border: 'none',
//               padding: '10px 20px',
//               borderRadius: '4px',
//               cursor: 'pointer',
//               marginTop: '15px',
//               fontSize: '16px'
//             }}
//           >
//             Reintentar
//           </button>
//         </div>
//       ) : (
//         <iframe
//           src={iframeUrl}
//           width="100%"
//           height="800px"
//           title="Aplicación de Pronóstico"
//           frameBorder="0"
//           allowFullScreen
//           onLoad={handleIframeLoad}
//           onError={handleIframeError}
//           style={{ 
//             display: isLoading ? 'none' : 'block',
//             border: 'none',
//             borderRadius: '8px',
//             boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
//           }}
//         />
//       )}
      
//       <style>
//         {`
//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default Pronostico;