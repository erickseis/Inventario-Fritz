import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { DataMovimientosProvider } from './hooks/movimientos.context'

createRoot(document.getElementById('root')).render(
<DataMovimientosProvider>
    <App />
</DataMovimientosProvider>
)
