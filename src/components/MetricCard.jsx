import React from 'react';

const MetricCard = ({ title, value, icon, color = 'primary' }) => {
  const colorClasses = {
    primary: 'text-primary',
    success: 'text-success',
    info: 'text-info',
    warning: 'text-warning',
    danger: 'text-danger'
  };

  return (
    <div className="card bg-white border-0 rounded-3 shadow-sm h-100" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0">
            <span className={`fs-2 ${colorClasses[color]}`}>{icon}</span>
          </div>
          <div className="flex-grow-1 ms-3">
            <h6 className="card-title mb-0 text-muted">{title}</h6>
            <h3 className={`mb-0 fw-bold ${colorClasses[color]}`}>{value}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
