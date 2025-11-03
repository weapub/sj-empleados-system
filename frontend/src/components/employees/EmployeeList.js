import React, { useState, useEffect } from 'react';
import { Table, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getEmployees, deleteEmployee } from '../../services/api';
import MobileCard from '../common/MobileCard';

const EmployeeList = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
      setError('');
    } catch (err) {
      setError('Error al cargar los empleados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
      try {
        await deleteEmployee(id);
        setEmployees(employees.filter(employee => employee._id !== id));
      } catch (err) {
        setError('Error al eliminar el empleado');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Empleados</h1>
        <Link to="/employees/new">
          <Button variant="success">Nuevo Empleado</Button>
        </Link>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {employees.length === 0 ? (
        <Alert variant="info">No hay empleados registrados</Alert>
      ) : (
        <>
          {/* Vista de escritorio - Tabla */}
          <div className="desktop-view">
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Puesto</th>
                  <th>Departamento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(employee => (
                  <tr key={employee._id}>
                    <td>{employee.nombre} {employee.apellido}</td>
                    <td>{employee.email}</td>
                    <td>{employee.puesto}</td>
                    <td>{employee.departamento}</td>
                    <td>
                      <Link to={`/employees/${employee._id}`}>
                        <Button variant="info" size="sm" className="me-2">Ver</Button>
                      </Link>
                      <Link to={`/employees/edit/${employee._id}`}>
                        <Button variant="warning" size="sm" className="me-2">Editar</Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(employee._id)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Vista móvil - Tarjetas */}
          <div className="mobile-view">
            {employees.map(employee => (
              <MobileCard
                key={employee._id}
                title={`${employee.nombre} ${employee.apellido}`}
                subtitle={employee.email}
                fields={[
                  { label: 'Puesto', value: employee.puesto || 'No especificado' },
                  { label: 'Departamento', value: employee.departamento || 'No especificado' }
                ]}
                actions={[
                  {
                    text: 'Ver',
                    variant: 'info',
                    onClick: () => navigate(`/employees/${employee._id}`)
                  },
                  {
                    text: 'Editar',
                    variant: 'warning',
                    onClick: () => navigate(`/employees/edit/${employee._id}`)
                  },
                  {
                    text: 'Eliminar',
                    variant: 'danger',
                    onClick: () => handleDelete(employee._id)
                  }
                ]}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeList;