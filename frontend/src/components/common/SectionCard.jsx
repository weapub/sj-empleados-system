import React from 'react';
import { Card } from 'react-bootstrap';

// Tarjeta de sección unificada con título, icono y acciones en el header
const SectionCard = ({ title, icon = null, headerRight = null, children, className = '', accentColor }) => {
  return (
    <Card className={`section-card leaflet-panel ${className}`} style={accentColor ? { ['--leaflet-accent']: accentColor } : undefined}>
      {(title || icon || headerRight) && (
        <Card.Header className="section-card-header leaflet-header">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              {icon && <span className="text-slate-700">{icon}</span>}
              {title && <h5 className="mb-0 fw-semibold text-slate-700">{title}</h5>}
            </div>
            {headerRight && (
              <div className="d-flex align-items-center gap-2">
                {headerRight}
              </div>
            )}
          </div>
        </Card.Header>
      )}
      <Card.Body className="leaflet-body">{children}</Card.Body>
    </Card>
  );
};

export default SectionCard;