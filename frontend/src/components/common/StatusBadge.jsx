import React from 'react';

const StatusBadge = ({ label, variant = 'info' }) => {
  return (
    <span className={`status-badge status-${variant}`}>{label}</span>
  );
};

export default StatusBadge;