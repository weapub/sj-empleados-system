import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Badge, Row, Col, Form, Card } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getAllPayrollReceipts, deletePayrollReceipt } from '../../services/api';
import MobileCard from '../common/MobileCard';

const daysInMonth = (period) => {
  // period in format YYYY-MM
  try {
    const [yearStr, monthStr] = period.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    return new Date(year, month, 0).getDate();
  } catch (_) {
    return 30;
  }
};

const formatCurrency = (value) => {
  return `$${Number(value || 0).toLocaleString('es-AR')}`;
};

const formatDate = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR');
};

const PayrollList = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [sortBy, setSortBy] = useState('paymentDate');
  const [sortDir, setSortDir] = useState('desc');

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const data = await getAllPayrollReceipts();
      setReceipts(data);
    } catch (err) {
      console.error('Error al cargar recibos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deletePayrollReceipt(id);
          Swal.fire('Eliminado', 'El recibo ha sido eliminado', 'success');
          loadReceipts();
        } catch (error) {
          console.error('Error al eliminar:', error);
          Swal.fire('Error', 'No se pudo eliminar el recibo', 'error');
        }
      }
    });
  };

  const filteredReceipts = receipts.filter(r => {
    const matchEmployee = filterEmployee ? (r.employee && r.employee._id === filterEmployee) : true;
    const matchPeriod = filterPeriod ? (r.period === filterPeriod) : true;
    return matchEmployee && matchPeriod;
  });

  const parsePeriod = (period) => {
    if (!period) return new Date(0);
    const [yearStr, monthStr] = period.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    return new Date(year, month, 1);
  };

  const sortedReceipts = [...filteredReceipts].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'employee') {
      const an = a.employee ? `${a.employee.nombre} ${a.employee.apellido}`.toLowerCase() : '';
      const bn = b.employee ? `${b.employee.nombre} ${b.employee.apellido}`.toLowerCase() : '';
      return an.localeCompare(bn) * dir;
    }
    if (sortBy === 'period') {
      return (parsePeriod(a.period) - parsePeriod(b.period)) * dir;
    }
    if (sortBy === 'paymentDate') {
      const ad = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
      const bd = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
      return (ad - bd) * dir;
    }
    if (sortBy === 'extra') {
      const an = Number(a.extraHours || 0);
      const bn = Number(b.extraHours || 0);
      return (an - bn) * dir;
    }
    if (sortBy === 'other') {
      const an = Number(a.otherAdditions || 0);
      const bn = Number(b.otherAdditions || 0);
      return (an - bn) * dir;
    }
    if (sortBy === 'discounts') {
      const an = Number(a.discounts || 0);
      const bn = Number(b.discounts || 0);
      return (an - bn) * dir;
    }
    if (sortBy === 'advance') {
      const an = a.advanceRequested ? (Number(a.advanceAmount) || 0) : 0;
      const bn = b.advanceRequested ? (Number(b.advanceAmount) || 0) : 0;
      return (an - bn) * dir;
    }
    if (sortBy === 'net') {
      const an = Number(a.netAmount || 0);
      const bn = Number(b.netAmount || 0);
      return (an - bn) * dir;
    }
    if (sortBy === 'weekly') {
      const dimA = daysInMonth(a.period);
      const dimB = daysInMonth(b.period);
      const netA = Number(a.netAmount) || 0;
      const netB = Number(b.netAmount) || 0;
      const advA = a.advanceRequested ? (Number(a.advanceAmount) || 0) : 0;
      const advB = b.advanceRequested ? (Number(b.advanceAmount) || 0) : 0;
      const an = Math.round(((netA / dimA) * 7) - advA);
      const bn = Math.round(((netB / dimB) * 7) - advB);
      return (an - bn) * dir;
    }
    if (sortBy === 'status') {
      const score = (x) => (x.signed ? 2 : 0) + (x.hasPresentismo ? 1 : 0);
      return (score(a) - score(b)) * dir;
    }
    return 0;
  });

  const handleSort = (field, e) => {
    if (e && e.altKey) {
      setSortBy('paymentDate');
      setSortDir('desc');
      return;
    }
    if (sortBy === field) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const renderSort = (field) => {
    if (sortBy !== field) return null;
    return sortDir === 'asc' ? <FaSortUp className="ms-1" /> : <FaSortDown className="ms-1" />;
  };

  const resetSort = () => {
    setSortBy('paymentDate');
    setSortDir('desc');
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Recibos de Sueldo</h2>
        <Button variant="primary" onClick={() => navigate('/payroll/new')}>
          <FaPlus className="me-1" /> Nuevo Recibo
        </Button>
      </div>

      <Card className="mb-3">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filtrar por Empleado</Form.Label>
                <Form.Select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)}>
                  <option value="">Todos</option>
                  {receipts
                    .map(r => r.employee)
                    .filter(Boolean)
                    .reduce((acc, emp) => {
                      if (!acc.find(x => x._id === emp._id)) acc.push(emp);
                      return acc;
                    }, [])
                    .map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.nombre} {emp.apellido} ({emp.legajo})</option>
                    ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filtrar por Período</Form.Label>
                <Form.Control type="month" value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={12} className="d-flex justify-content-end">
              <Button variant="outline-secondary" size="sm" onClick={resetSort} title="Resetear orden a Pago descendente">
                Reset orden
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          {/* Vista de escritorio */}
          <div className="d-none d-md-block">
            <Table striped bordered hover responsive className="payroll-table">
              <thead>
                <tr>
                  <th role="button" title="Ordenar (Alt+Click para reset)" onClick={(e) => handleSort('employee', e)}>Empleado {renderSort('employee')}</th>
                  <th role="button" title="Ordenar (Alt+Click para reset)" onClick={(e) => handleSort('period', e)}>Período {renderSort('period')}</th>
                  <th role="button" title="Ordenar (Alt+Click para reset)" onClick={(e) => handleSort('paymentDate', e)}>Pago {renderSort('paymentDate')}</th>
                  <th role="button" title="Ordenar (Alt+Click para reset)" onClick={(e) => handleSort('status', e)}>Estado {renderSort('status')}</th>
                  <th role="button" title="Ordenar (Alt+Click para reset)" onClick={(e) => handleSort('extra', e)}>Horas Extras {renderSort('extra')}</th>
                  <th role="button" title="Ordenar (Alt+Click para reset)" onClick={(e) => handleSort('other', e)}>Otros {renderSort('other')}</th>
                  <th role="button" title="Ordenar (Alt+Click para reset)" onClick={(e) => handleSort('discounts', e)}>Descuentos {renderSort('discounts')}</th>
                  <th role="button" title="Ordenar (Alt+Click para reset)" onClick={(e) => handleSort('advance', e)}>Adelanto {renderSort('advance')}</th>
                  <th role="button" title="Ordenar (Alt+Click para reset)" onClick={(e) => handleSort('net', e)}>Neto {renderSort('net')}</th>
                  <th role="button" title="Ordenar (Alt+Click para reset)" onClick={(e) => handleSort('weekly', e)}>Semanal {renderSort('weekly')}</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center">No hay recibos registrados</td>
                  </tr>
                ) : (
                  sortedReceipts.map((r) => {
                  const dim = daysInMonth(r.period);
                  const netToPay = Number(r.netAmount) || 0;
                  const advance = r.advanceRequested ? (Number(r.advanceAmount) || 0) : 0;
                  const weekly = Math.round(((netToPay / dim) * 7) - advance);
                    return (
                      <tr key={r._id}>
                        <td>
                          <div className="fw-semibold text-truncate" title={r.employee ? `${r.employee.nombre} ${r.employee.apellido}` : ''}>
                            {r.employee ? `${r.employee.nombre} ${r.employee.apellido}` : '-'}
                          </div>
                          <small className="text-muted">Legajo: {r.employee?.legajo || '-'}</small>
                        </td>
                        <td>
                          <div>{r.period}</div>
                          <small className="text-muted">Días: {dim}</small>
                        </td>
                        <td>{formatDate(r.paymentDate)}</td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <Badge bg={r.hasPresentismo ? 'success' : 'secondary'}>
                              {r.hasPresentismo ? 'Con Presentismo' : 'Sin Presentismo'}
                            </Badge>
                            <Badge bg={r.signed ? 'info' : 'warning'}>
                              {r.signed ? `Firmado` : 'Sin Firmar'}
                            </Badge>
                          </div>
                        </td>
                        <td>{formatCurrency(r.extraHours)}</td>
                        <td>{formatCurrency(r.otherAdditions)}</td>
                        <td>{formatCurrency(r.discounts)}</td>
                        <td>
                          <div className="d-flex flex-column">
                            <Badge bg={r.advanceRequested ? 'warning' : 'secondary'} className="mb-1">
                              {r.advanceRequested ? 'Con Adelanto' : 'Sin Adelanto'}
                            </Badge>
                            <span>{formatCurrency(r.advanceAmount)}</span>
                          </div>
                        </td>
                        <td className="text-success fw-bold">{formatCurrency(netToPay)}</td>
                        <td>{formatCurrency(weekly)}</td>
                        <td>
                          <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => navigate(`/payroll/${r._id}`)}>
                            Ver
                          </Button>
                          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => navigate(`/payroll/edit/${r._id}`)}>
                            <FaEdit />
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(r._id)}>
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>

          {/* Vista móvil */}
          <div className="d-md-none">
            {filteredReceipts.length === 0 ? (
              <p className="text-center">No hay recibos registrados</p>
            ) : (
              filteredReceipts.map((r) => {
                const dim = daysInMonth(r.period);
                const netToPay = Number(r.netAmount) || 0;
                const advance = r.advanceRequested ? (Number(r.advanceAmount) || 0) : 0;
                const weekly = Math.round(((netToPay / dim) * 7) - advance);
                return (
                  <MobileCard
                    key={r._id}
                    title={r.employee ? `${r.employee.nombre} ${r.employee.apellido}` : 'Sin empleado'}
                    subtitle={`Período: ${r.period} | Legajo: ${r.employee?.legajo || '-'}`}
                    fields={[
                      { label: 'Fecha de Pago', value: formatDate(r.paymentDate) },
                      { label: 'Horas Extras', value: formatCurrency(r.extraHours) },
                      { label: 'Otros Adicionales', value: formatCurrency(r.otherAdditions) },
                      { label: 'Descuentos', value: formatCurrency(r.discounts) },
                      { label: 'Monto Adelanto', value: formatCurrency(r.advanceAmount) },
                      { label: 'Monto Semanal', value: formatCurrency(weekly) }
                    ]}
                    badges={[
                      { 
                        text: `Neto: ${formatCurrency(netToPay)}`, 
                        variant: 'success' 
                      },
                      { 
                        text: r.hasPresentismo ? 'Con Presentismo' : 'Sin Presentismo', 
                        variant: r.hasPresentismo ? 'success' : 'secondary' 
                      },
                      { 
                        text: r.signed ? 'Firmado' : 'Sin Firmar', 
                        variant: r.signed ? 'info' : 'warning' 
                      }
                    ]}
                    actions={[
                      {
                        text: 'Ver',
                        variant: 'outline-secondary',
                        size: 'sm',
                        onClick: () => navigate(`/payroll/${r._id}`)
                      },
                      {
                        text: <FaEdit />,
                        variant: 'outline-primary',
                        size: 'sm',
                        onClick: () => navigate(`/payroll/edit/${r._id}`)
                      },
                      {
                        text: <FaTrash />,
                        variant: 'outline-danger',
                        size: 'sm',
                        onClick: () => handleDelete(r._id)
                      }
                    ]}
                  />
                );
              })
            )}
          </div>
        </>
      )}
    </Container>
  );
};

export default PayrollList;