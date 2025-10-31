import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Card, Badge, Row, Col, Form } from 'react-bootstrap';
import DocumentViewerModal from '../common/DocumentViewerModal';
import { getAttendances, getEmployees, deleteAttendance } from '../../services/api';

const AttendanceList = () => {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    employeeId: '',
    type: '',
    justified: ''
  });
  const [viewerUrl, setViewerUrl] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [attendancesData, employeesData] = await Promise.all([
          getAttendances(),
          getEmployees()
        ]);
        setAttendances(attendancesData);
        setEmployees(employeesData);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({
      ...filter,
      [name]: value
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este registro?')) {
      try {
        await deleteAttendance(id);
        setAttendances(attendances.filter(attendance => attendance._id !== id));
      } catch (err) {
        setError('Error al eliminar el registro');
      }
    }
  };

  const filteredAttendances = attendances.filter(attendance => {
    return (
      (filter.employeeId === '' || attendance.employee._id === filter.employeeId) &&
      (filter.type === '' || attendance.type === filter.type) &&
      (filter.justified === '' || 
        (filter.justified === 'true' && attendance.justified) || 
        (filter.justified === 'false' && !attendance.justified))
    );
  });

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp._id === employeeId);
    return employee ? `${employee.nombre} ${employee.apellido}` : 'Desconocido';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR');
  };

  const openViewer = (url) => {
    setViewerUrl(url);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerUrl(null);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Inasistencias y Tardanzas</h4>
        <Link to="/attendance/new">
          <Button variant="primary">Registrar Nueva</Button>
        </Link>
      </Card.Header>
      <Card.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Filtrar por Empleado</Form.Label>
              <Form.Select
                name="employeeId"
                value={filter.employeeId}
                onChange={handleFilterChange}
              >
                <option value="">Todos los empleados</option>
                {employees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.nombre} {employee.apellido}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Tipo</Form.Label>
              <Form.Select
                name="type"
                value={filter.type}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                <option value="inasistencia">Inasistencia</option>
                <option value="tardanza">Tardanza</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Justificado</Form.Label>
              <Form.Select
                name="justified"
                value={filter.justified}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Hora establecida</th>
              <th>Hora registrada</th>
              <th>Min tardanza</th>
              <th>Vence cert.</th>
              <th>Vac. inicio</th>
              <th>Vac. fin</th>
              <th>Reincorporación</th>
              <th>Justificado</th>
              <th>Presentismo</th>
              <th>Certificado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendances.length > 0 ? (
              filteredAttendances.map(attendance => (
                <tr key={attendance._id}>
                  <td>{attendance.employee ? `${attendance.employee.nombre} ${attendance.employee.apellido}` : 'Desconocido'}</td>
                  <td>{formatDate(attendance.date)}</td>
                  <td>
                    <Badge bg={
                      attendance.type === 'inasistencia' ? 'danger' :
                      attendance.type === 'tardanza' ? 'warning' :
                      attendance.type === 'licencia medica' ? 'info' :
                      attendance.type === 'vacaciones' ? 'secondary' : 'dark'
                    }>
                      {attendance.type}
                    </Badge>
                  </td>
                  <td>{attendance.type === 'tardanza' ? (attendance.scheduledEntry || '-') : '-'}</td>
                  <td>{attendance.type === 'tardanza' ? (attendance.actualEntry || '-') : '-'}</td>
                  <td>{attendance.type === 'tardanza' ? (attendance.lateMinutes ?? 0) : '-'}</td>
                  <td>{attendance.type === 'licencia medica' && attendance.certificateExpiry ? formatDate(attendance.certificateExpiry) : '-'}</td>
                  <td>{attendance.type === 'vacaciones' && attendance.vacationsStart ? formatDate(attendance.vacationsStart) : '-'}</td>
                  <td>{attendance.type === 'vacaciones' && attendance.vacationsEnd ? formatDate(attendance.vacationsEnd) : '-'}</td>
                  <td>{attendance.returnToWorkDate ? formatDate(attendance.returnToWorkDate) : '-'}</td>
                  <td>
                    <Badge bg={attendance.justified ? 'success' : 'danger'}>
                      {attendance.justified ? 'Sí' : 'No'}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={attendance.lostPresentismo ? 'danger' : 'success'}>
                      {attendance.lostPresentismo ? 'Perdido' : 'Conservado'}
                    </Badge>
                  </td>
                  <td>
                    {attendance.justificationDocument ? (
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => openViewer(attendance.justificationDocument)}
                      >
                        Ver certificado
                      </Button>
                    ) : (
                      'No disponible'
                    )}
                  </td>
                  <td>
                    <Link to={`/attendance/edit/${attendance._id}`} className="btn btn-sm btn-primary me-2">
                      Editar
                    </Link>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDelete(attendance._id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">No hay registros que coincidan con los filtros</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
      <DocumentViewerModal 
        show={viewerOpen}
        onHide={closeViewer}
        url={viewerUrl}
        title="Documento de asistencia"
      />
    </Card>
  );
};

export default AttendanceList;