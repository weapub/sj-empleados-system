import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { createEmployee, getEmployeeById, updateEmployee } from '../../services/api';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    telefono: '',
    puesto: '',
    departamento: '',
    salario: '',
    fechaContratacion: '',
    activo: true,
    cuit: '',
    fechaIngreso: '',
    fechaRegistroARCA: '',
    fechaNacimiento: '',
    lugarNacimiento: '',
    domicilio: '',
    sucursal: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const fetchEmployee = async () => {
        try {
          const data = await getEmployeeById(id);
          // Formatear la fecha para el input date
          const fechaFormateada = data.fechaContratacion 
            ? new Date(data.fechaContratacion).toISOString().split('T')[0]
            : '';
          
          setFormData({
            ...data,
            fechaContratacion: fechaFormateada
          });
        } catch (err) {
          setError('Error al cargar los datos del empleado');
          console.error(err);
        }
      };
      
      fetchEmployee();
    }
  }, [id, isEditing]);

  const onChange = e => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isEditing) {
        await updateEmployee(id, formData);
      } else {
        await createEmployee(formData);
      }
      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el empleado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>{isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}</h1>
      <Card>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={onSubmit}>
            <div className="row">
              <div className="col-12 col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-12 col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Apellido</Form.Label>
                  <Form.Control
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-12 col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>DNI</Form.Label>
                  <Form.Control
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={onChange}
                  />
                </Form.Group>
              </div>
              <div className="col-12 col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Legajo (se genera automáticamente)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.dni ? `SJ-${String(formData.dni).replace(/\D/g,'')}` : ''}
                    disabled
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    name="telefono"
                    value={formData.telefono}
                    onChange={onChange}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Puesto</Form.Label>
                  <Form.Control
                    type="text"
                    name="puesto"
                    value={formData.puesto}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Departamento</Form.Label>
                  <Form.Control
                    type="text"
                    name="departamento"
                    value={formData.departamento}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Salario</Form.Label>
                  <Form.Control
                    type="number"
                    name="salario"
                    value={formData.salario}
                    onChange={onChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Contratación</Form.Label>
                  <Form.Control
                    type="date"
                    name="fechaContratacion"
                    value={formData.fechaContratacion}
                    onChange={onChange}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>CUIT</Form.Label>
                  <Form.Control
                    type="text"
                    name="cuit"
                    value={formData.cuit}
                    onChange={onChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Ingreso</Form.Label>
                  <Form.Control
                    type="date"
                    name="fechaIngreso"
                    value={formData.fechaIngreso}
                    onChange={onChange}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Registro en ARCA</Form.Label>
                  <Form.Control
                    type="date"
                    name="fechaRegistroARCA"
                    value={formData.fechaRegistroARCA}
                    onChange={onChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Nacimiento</Form.Label>
                  <Form.Control
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={onChange}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Lugar de Nacimiento</Form.Label>
                  <Form.Control
                    type="text"
                    name="lugarNacimiento"
                    value={formData.lugarNacimiento}
                    onChange={onChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Domicilio</Form.Label>
                  <Form.Control
                    type="text"
                    name="domicilio"
                    value={formData.domicilio}
                    onChange={onChange}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Sucursal</Form.Label>
                  <Form.Control
                    type="text"
                    name="sucursal"
                    value={formData.sucursal}
                    onChange={onChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Activo"
                    name="activo"
                    checked={formData.activo}
                    onChange={onChange}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="d-flex justify-content-between">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/employees')}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EmployeeForm;