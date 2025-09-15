// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/pronostico': {
//         target: 'http://localhost:8501',
//         changeOrigin: true,
//         ws: true,
//         // No rewrite: mantenemos el subpath para que Streamlit sirva correctamente en /pronostico
//         configure: (proxy) => {
//           proxy.on('proxyRes', (proxyRes) => {
//             if (proxyRes && proxyRes.headers) {
//               // Eliminar cabeceras que bloquean el embebido en iframe
//               delete proxyRes.headers['x-frame-options']
//               const csp = proxyRes.headers['content-security-policy']
//               if (csp) {
//                 // Quitar la directiva frame-ancestors si existe
//                 proxyRes.headers['content-security-policy'] = csp.replace(/frame-ancestors[^;]*;?/i, '')
//               }
//             }
//           })
//         },
//       },
//       // Evitar colisión con la ruta SPA /pronostico creando un alias /st
//       '/st': {
//         target: 'http://localhost:8501',
//         changeOrigin: true,
//         ws: true,
//         rewrite: (path) => path.replace(/^\/st/, '/'),
//         configure: (proxy) => {
//           proxy.on('proxyRes', (proxyRes) => {
//             if (proxyRes && proxyRes.headers) {
//               delete proxyRes.headers['x-frame-options']
//               const csp = proxyRes.headers['content-security-policy']
//               if (csp) {
//                 proxyRes.headers['content-security-policy'] = csp.replace(/frame-ancestors[^;]*;?/i, '')
//               }
//             }
//           })
//         },
//       },
//     },
//   },
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/pronostico': {
        target: 'http://172.24.0.125:9888', // Cambiado a la IP correcta
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/pronostico/, ''),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            if (proxyRes && proxyRes.headers) {
              // Eliminar cabeceras que bloquean el embebido en iframe
              delete proxyRes.headers['x-frame-options']
              const csp = proxyRes.headers['content-security-policy']
              if (csp) {
                // Permitir embedding en iframe desde cualquier origen
                proxyRes.headers['content-security-policy'] = csp
                  .replace(/frame-ancestors[^;]*;?/i, '')
                  // Añadir política para permitir iframe embedding
                  + "frame-ancestors 'self' http://localhost:5173 http://localhost:9887 https://inventario-view-fritz.fritzvzla.com;"
              }
            }
          })
        },
      },
    },
  },
  // Configuración para construir la aplicación
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Especificar la base para producción si es necesario
    emptyOutDir: true,
  },
})