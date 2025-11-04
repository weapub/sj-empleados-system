// Función para formatear fechas
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Formateador de moneda consistente para ARS
export const formatCurrency = (value) => {
  const num = Number(value || 0);
  return `$${num.toLocaleString('es-AR')}`;
};