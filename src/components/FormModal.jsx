import React, { useState, useEffect } from 'react';
import { stockMinimo } from '../service/connection';

const FormModal = ({ 
  show, 
  onClose, 
  fetchStockMinimo,
  // onSubmit, 
  title, 
  fields, 
  initialData = null 
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Inicializar con valores por defecto
      const initialValues = {};
      fields.forEach(field => {
        initialValues[field.name] = field.type === 'number' ? 0 : '';
      });
      setFormData(initialValues);
    }
    setErrors({});
  }, [initialData, fields, show]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Limpiar error al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} es requerido`;
      }
      
      if (field.type === 'number' && formData[field.name] < 0) {
        newErrors[field.name] = `${field.label} debe ser mayor o igual a 0`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const onSubmit = async (data) => {
    try {
      const response = await stockMinimo(data);   // axios response object
      console.log(response.data);                 // OK
    } catch (error) {
      // Safely read server message OR generic error
      const msg = error.response?.data?.message || error.message || 'Error desconocido';
      console.error(msg);
      alert(msg);   // o setErrors, toast, etc.
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
      fetchStockMinimo();
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-ls">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                {fields.map(field => (
                  <div key={field.name} >
                    <div className="mb-3">
                      <label htmlFor={field.name} className="form-label">
                        {field.label}
                        {field.required && <span className="text-danger">*</span>}
                      </label>
                      
                      {field.type === 'select' ? (
                        <select
                          id={field.name}
                          name={field.name}
                          className={`form-select ${errors[field.name] ? 'is-invalid' : ''}`}
                          value={formData[field.name] || ''}
                          onChange={handleChange}
                          required={field.required}
                        >
                          <option value="">Seleccione...</option>
                          {field.options.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          id={field.name}
                          name={field.name}
                          className={`form-control ${errors[field.name] ? 'is-invalid' : ''}`}
                          value={formData[field.name] || ''}
                          onChange={handleChange}
                          required={field.required}
                          rows={3}
                        />
                      ) : (
                        <input
                          type={field.type}
                          id={field.name}
                          name={field.name}
                          className={`form-control ${errors[field.name] ? 'is-invalid' : ''}`}
                          value={formData[field.name] || ''}
                          onChange={handleChange}
                          required={field.required}
                          step={field.type === 'number' ? '0.01' : undefined}
                          min={field.type === 'number' ? 0 : undefined}
                        />
                      )}
                      
                      {errors[field.name] && (
                        <div className="invalid-feedback">
                          {errors[field.name]}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormModal;
