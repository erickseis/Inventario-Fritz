import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';

const MateriaPrima = () => {
  const { data: materiaPrima, addItem, updateItem, deleteItem } = useData('materia_prima');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre', sortable: true },
    { key: 'unidad_medida', label: 'Unidad', sortable: true },
    { key: 'stock_actual', label: 'Stock Actual', sortable: true, render: (value) => `${value} ${value.unidad_medida || 'un'}` },
    { key: 'costo_unitario', label: 'Costo Unitario', sortable: true, render: (value) => `$${parseFloat(value).toFixed(2)}` }
  ];

  const formFields = [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    { name: 'unidad_medida', label: 'Unidad de Medida', type: 'select', required: true, options: [
      { value: 'kg', label: 'Kilogramo' },
      { value: 'm', label: 'Metro' },
      { value: 'm²', label: 'Metro cuadrado' },
      { value: 'litro', label: 'Litro' },
      { value: 'unidad', label: 'Unidad' }
    ]},
    { name: 'stock_actual', label: 'Stock Actual', type: 'number', required: true },
    { name: 'costo_unitario', label: 'Costo Unitario', type: 'number', required: true }
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleSubmit = (formData) => {
    if (editingItem) {
      updateItem(editingItem.id, formData);
    } else {
      addItem(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar esta materia prima?')) {
      deleteItem(id);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Gestión de Materia Prima</h1>
      </div>

      <DataTable
        data={materiaPrima}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        title="Listado de Materia Prima"
        searchPlaceholder="Buscar materia prima..."
      />

      <FormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={editingItem ? 'Editar Materia Prima' : 'Nueva Materia Prima'}
        fields={formFields}
        initialData={editingItem}
      />
    </div>
  );
};

export default MateriaPrima;
