# Sistema de Inventario Fritz

Un sistema de gestión de inventario completo construido con React, Bootstrap 5 y Chart.js. Este proyecto simula un sistema de inventario con datos locales en archivos JSON.

## 🚀 Tecnologías Utilizadas

- **React 19** con Vite
- **Bootstrap 5.3** para estilos y componentes UI
- **React Router** para navegación
- **Chart.js** y **react-chartjs-2** para gráficos
- **Hooks personalizados** para manejo de datos

## 📦 Instalación

1. Clona el repositorio
2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Navbar.jsx      # Navegación principal
│   ├── MetricCard.jsx  # Tarjetas de métricas
│   ├── DataTable.jsx   # Tabla de datos con filtros
│   ├── FormModal.jsx   # Modal para formularios
│   ├── SalesChart.jsx  # Gráfico de ventas
│   └── ProductionChart.jsx # Gráfico de producción
├── pages/              # Páginas principales
│   ├── Dashboard.jsx   # Dashboard principal
│   ├── Productos.jsx   # CRUD de productos
│   ├── MateriaPrima.jsx # CRUD de materia prima
│   ├── Produccion.jsx  # Registro de producción
│   └── Ventas.jsx      # Registro de ventas
├── hooks/
│   └── useData.js      # Hook para cargar datos JSON
├── data/               # Archivos JSON con datos de prueba
│   ├── productos.json
│   ├── materia_prima.json
│   ├── ventas.json
│   └── produccion.json
└── utils/              # Utilidades y helpers
```

## 📊 Características

### Dashboard Principal
- **Métricas clave**: Total de productos, stock de materias primas, ventas del mes, producción del mes
- **Gráficos interactivos**: Evolución de ventas mensuales y producción mensual
- **Actividad reciente**: Últimas ventas y producciones

### Gestión de Productos
- CRUD completo para productos
- Campos: ID, nombre, categoría, precio, stock, descripción
- Búsqueda y ordenamiento
- Validación de formularios

### Gestión de Materia Prima
- CRUD para materias primas
- Campos: ID, nombre, unidad de medida, stock actual, costo unitario
- Control de inventario de insumos

### Registro de Producción
- Registro de nuevas producciones
- Asociación con productos existentes
- Cálculo automático de costos

### Registro de Ventas
- Registro de ventas por producto
- Cálculo automático del total
- Historial de ventas con filtros

## 🎯 Funcionalidades Adicionales

- **Filtros dinámicos**: Búsqueda por nombre, fecha, categoría
- **Ordenamiento**: Por cualquier columna en orden ascendente/descendente
- **Validación de formularios**: Campos requeridos y tipos de datos
- **Diseño responsive**: Adaptable a dispositivos móviles
- **Interfaz intuitiva**: Uso de Bootstrap 5 para una experiencia moderna

## 📋 Datos de Prueba

El proyecto incluye datos de prueba en archivos JSON que simulan:
- 5 productos diferentes
- 5 tipos de materia prima
- 8 ventas registradas
- 5 registros de producción

## 🔧 Desarrollo Futuro

- Integración con backend real
- Autenticación de usuarios
- Reportes personalizados
- Exportación de datos
- Gestión de proveedores
- Control de calidad

## 📝 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Vista previa de producción
- `npm run lint` - Ejecuta linter

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
#   I n v e n t a r i o - F r i t z  
 