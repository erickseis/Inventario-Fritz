import { useState } from "react";
import DataTable from "../components/DataTable";
import FormModal from "../components/FormModal";
import { useData } from "../hooks/useData";

const Ventas = () => {
  const { data: ventas, addItem } = useData("ventas");
  const { data: productos } = useData("productos");
  const [showModal, setShowModal] = useState(false);

  const columns = [
    { key: "id", label: "ID" },
    {
      key: "fecha",
      label: "Fecha",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    { key: "producto_nombre", label: "Producto", sortable: true },
    {
      key: "cantidad_vendida",
      label: "Cantidad",
      sortable: true,
      render: (value) => `${value} un`,
    },
    {
      key: "precio_unitario",
      label: "Precio Unitario",
      sortable: true,
      render: (value) => `$${parseFloat(value).toFixed(2)}`,
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (value) => `$${parseFloat(value).toFixed(2)}`,
    },
  ];

  const formFields = [
    { name: "fecha", label: "Fecha", type: "date", required: true },
    {
      name: "producto_id",
      label: "Producto",
      type: "select",
      required: true,
      options: productos.map((p) => ({ value: p.id, label: p.nombre })),
    },
    {
      name: "cantidad_vendida",
      label: "Cantidad",
      type: "number",
      required: true,
    },
  ];

  const handleAdd = () => {
    setShowModal(true);
  };

  const handleSubmit = (formData) => {
    const producto = productos.find(
      (p) => p.id === parseInt(formData.producto_id, 10),
    );
    const newVenta = {
      ...formData,
      producto_nombre: producto.nombre,
      precio_unitario: producto.precio,
      total:
        parseFloat(formData.cantidad_vendida) * parseFloat(producto.precio),
    };
    addItem(newVenta);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Gestión de Ventas</h1>
      </div>

      <DataTable
        data={ventas}
        columns={columns}
        onAdd={handleAdd}
        title="Registro de Ventas"
        searchPlaceholder="Buscar ventas..."
      />

      <FormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title="Nueva Venta"
        fields={formFields}
      />
    </div>
  );
};

export default Ventas;
