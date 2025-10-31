import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Badge, Row, Col, Form, Card } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getAllPayrollReceipts, deletePayrollReceipt } from '../../services/api';

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
          <Row className="g-3">
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
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Periodo</th>
              <th>Fecha de Pago</th>
              <th>Firmado</th>
              <th>Fecha Firma</th>
              <th>Presentismo</th>
              <th>Horas Extras</th>
              <th>Otros Adicionales</th>
              <th>Descuentos</th>
              <th>Adelanto</th>
              <th>Monto Adelanto</th>
              <th>NETO A COBRAR</th>
              <th>Monto Semanal</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredReceipts.length === 0 ? (
              <tr>
                <td colSpan="14" className="text-center">No hay recibos registrados</td>
              </tr>
            ) : (
              filteredReceipts.map((r) => {
                const dim = daysInMonth(r.period);
                const netToPay = Number(r.netAmount) || 0; // backend already guarda neto final
                const weekly = Math.round((netToPay / dim) * 7);
                return (
                  <tr key={r._id}>
                    <td>{r.employee ? `${r.employee.nombre} ${r.employee.apellido} (${r.employee.legajo})` : '-'}</td>
                    <td>{r.period}</td>
                    <td>{formatDate(r.paymentDate)}</td>
                    <td>{r.signed ? 'Sí' : 'No'}</td>
                    <td>{formatDate(r.signedDate)}</td>
                    <td><Badge bg={r.hasPresentismo ? 'success' : 'secondary'}>{r.hasPresentismo ? 'Sí' : 'No'}</Badge></td>
                    <td>{formatCurrency(r.extraHours)}</td>
                    <td>{formatCurrency(r.otherAdditions)}</td>
                    <td>{formatCurrency(r.discounts)}</td>
                    <td>{r.advanceRequested ? 'Sí' : 'No'}</td>
                    <td>{formatCurrency(r.advanceAmount)}</td>
                    <td>{formatCurrency(netToPay)}</td>
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
      )}
    </Container>
  );
};

export default PayrollList;