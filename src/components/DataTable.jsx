import React, { useState } from 'react';

const DataTable = ({ 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  onAdd,
  title,
  searchPlaceholder = "Buscar..."
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Filtrar datos
  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Ordenar datos
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{title}</h5>
          {onAdd && (
            <button className="btn btn-primary" onClick={onAdd}>
              <i className="bi bi-plus"></i> Agregar
            </button>
          )}
        </div>
      </div>
      
      <div className="card-body">
        <div className="row mb-3">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                {columns.map(column => (
                  <th 
                    key={column.key}
                    style={{ cursor: column.sortable ? 'pointer' : 'default' }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      <i className={`bi bi-chevron-${sortDirection === 'asc' ? 'up' : 'down'} ms-1`}></i>
                    )}
                  </th>
                ))}
                {(onEdit || onDelete) && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center">
                    No hay datos disponibles
                  </td>
                </tr>
              ) : (
                sortedData.map((item, index) => (
                  <tr key={item.id || index}>
                    {columns.map(column => (
                      <td key={column.key}>
                        {column.render 
                          ? column.render(item[column.key], item)
                          : item[column.key]
                        }
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td>
                        <div className="btn-group" role="group">
                          {onEdit && (
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => onEdit(item)}
                              title="Editar"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          )}
                          {onDelete && (
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => onDelete(item.id)}
                              title="Eliminar"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Mostrando {sortedData.length} de {data.length} registros
          </small>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
