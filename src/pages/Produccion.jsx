import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';

const Produccion = () => {
  const { data: produccion, addItem } = useData('produccion');
  const { data: productos } = useData('productos');
  const [showModal, setShowModal] = useState(false);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'fecha', label: 'Fecha', sortable: true, render: (value) => new Date(value).toLocaleDateString() },
    { key: 'producto_nombre', label: 'Producto', sortable: true },
    { key: 'cantidad', label: 'Cantidad', sortable: true, render: (value) => `${value} un` },
    { key: 'costo_total', label: 'Costo Total', sortable: true, render: (value) => `$${parseFloat(value).toFixed(2)}` }
  ];

  const formFields = [
    { name: 'fecha', label: 'Fecha', type: 'date', required: true },
    { name: 'producto_id', label: 'Producto', type: 'select', required: true, options: 
      productos.map(p => ({ value: p.id, label: p.nombre }))
    },
    { name: 'cantidad', label: 'Cantidad', type: 'number', required: true }
  ];

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleSubmit = (formData) => {
    const producto = productos.find(p => p.id === parseInt(formData.producto_id));
    const newProduccion = {
      ...formData,
      producto_nombre: producto.nombre,
      materias_primas: [],
      costo_total: 0
    };
    addItem(newProduccion);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Gestión de Producción</h1>
      </div>

      <DataTable
        data={produccion}
        columns={columns}
        onAdd={handleAdd}
        title="Registro de Producción"
        searchPlaceholder="Buscar producción..."
      />

      <FormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title="Nueva Producción"
        fields={formFields}
      />
    </div>
  );
};

export default Produccion;
