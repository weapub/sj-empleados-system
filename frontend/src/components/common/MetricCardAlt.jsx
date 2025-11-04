import React from 'react';
import { Card, Col } from 'react-bootstrap';

// Tarjeta KPI alternativa: diseño compacto con barra de acento lateral
const MetricCardAlt = ({
  title,
  value,
  icon,
  color = '#2563eb',
  loading = false,
  delta,
}) => {
  const isDown = typeof delta === 'string' && delta.trim().startsWith('-');
  const deltaClass = isDown ? 'kpi-delta down' : 'kpi-delta up';
  const deltaSymbol = isDown ? '▼' : '▲';

  return (
    <Col lg={3} md={6} sm={6} className="mb-4">
      <Card className="kpi-card h-100">
        <Card.Body className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="kpi-icon" style={{ borderColor: color }}>
              {icon && React.cloneElement(icon, { size: 22, color })}
            </div>
            {delta && (
              <span className={deltaClass}>
                <span className="kpi-delta-symbol">{deltaSymbol}</span>
                {delta}
              </span>
            )}
          </div>

          <div className="kpi-title text-muted text-uppercase fw-semibold mb-1" style={{ letterSpacing: '.02em' }}>
            {title}
          </div>
          <div className="kpi-value">
            {loading ? '...' : value}
          </div>
      </Card.Body>
    </Card>
  </Col>
);
};

export default MetricCardAlt;