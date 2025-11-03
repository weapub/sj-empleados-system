import React, { useEffect, useState } from 'react';
import { Form, Button, Row, Col, Table, Alert, Spinner, Card, Container } from 'react-bootstrap';
import { FaUser, FaWallet, FaShoppingCart, FaMoneyBillWave, FaHistory, FaCog } from 'react-icons/fa';
import { getEmployees } from '../../services/api';
import { getEmployeeAccount, updateWeeklyDeduction, addAccountPurchase, addAccountPayment } from '../../services/api';
import MobileCard from '../common/MobileCard';

const EmployeeAccountPage = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [weeklyDeductionAmount, setWeeklyDeductionAmount] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [purchaseDesc, setPurchaseDesc] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0,10));
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDesc, setPaymentDesc] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().slice(0,10));

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const data = await getEmployees();
        setEmployees(data);
        // Autoseleccionar el primer empleado para cargar la cuenta automáticamente
        if (Array.isArray(data) && data.length > 0 && !selectedEmployee) {
          const firstId = data[0]._id;
          setSelectedEmployee(firstId);
          // Cargar la cuenta del primer empleado
          try {
            await loadAccount(firstId);
          } catch (e) {
            // Mantener el error ya gestionado en loadAccount
          }
        }
      } catch (err) {
        setError('Error al cargar empleados');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  const loadAccount = async (employeeId) => {
    try {
      setLoading(true);
      const { account, transactions } = await getEmployeeAccount(employeeId);
      setAccount(account);
      setTransactions(transactions);
      setWeeklyDeductionAmount(account?.weeklyDeductionAmount ?? '');
      setError('');
    } catch (err) {
      setError('Error al cargar la cuenta del empleado');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmployee = async (e) => {
    const id = e.target.value;
    setSelectedEmployee(id);
    if (id) await loadAccount(id);
  };

  const handleUpdateWeeklyDeduction = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateWeeklyDeduction(selectedEmployee, Number(weeklyDeductionAmount) || 0);
      await loadAccount(selectedEmployee);
      setSuccess('Deducción semanal actualizada');
    } catch (err) {
      setError('Error al actualizar la deducción semanal');
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await addAccountPurchase({ employeeId: selectedEmployee, amount: Number(purchaseAmount) || 0, description: purchaseDesc, date: purchaseDate });
      await loadAccount(selectedEmployee);
      setPurchaseAmount('');
      setPurchaseDesc('');
      setPurchaseDate(new Date().toISOString().slice(0,10));
      setSuccess('Compra registrada');
    } catch (err) {
      setError('Error al registrar compra');
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await addAccountPayment({ employeeId: selectedEmployee, amount: Number(paymentAmount) || 0, description: paymentDesc, date: paymentDate });
      await loadAccount(selectedEmployee);
      setPaymentAmount('');
      setPaymentDesc('');
      setPaymentDate(new Date().toISOString().slice(0,10));
      setSuccess('Pago registrado');
    } catch (err) {
      setError('Error al registrar pago');
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  return (
    <Container fluid>
      <div className="mb-4">
        <h1 className="page-title text-gradient">
          <FaWallet className="me-3" />
          Cuenta Corriente del Empleado
        </h1>
        <p className="text-center text-muted fs-5">Gestión de adelantos, compras y pagos</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" />
          <p className="mt-2 text-muted">Cargando...</p>
        </div>
      )}

      {/* Selector de empleado */}
      <Card className="mb-4">
        <Card.Header className="bg-white">
          <h5 className="mb-0">
            <FaUser className="me-2" />
            Selección de Empleado
          </h5>
        </Card.Header>
        <Card.Body>
          <Form.Group controlId="employeeSelect">
            <Form.Label>Empleado</Form.Label>
            <Form.Select 
              value={selectedEmployee} 
              onChange={handleSelectEmployee}
              className="form-select-lg"
            >
              <option value="">Seleccione un empleado</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.nombre} {emp.apellido} — Legajo: {emp.legajo}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>

      {account && (
        <>
          {/* Información de la cuenta */}
          <Row className="mb-4">
            <Col lg={4} md={6} className="mb-3">
              <Card className="h-100 balance-card">
                <Card.Body className="text-center">
                  <FaWallet size={40} className="text-white mb-3" />
                  <h5 className="card-title text-white">Saldo Actual</h5>
                  <h2 className="text-white fw-bold">
                    ${account.balance?.toLocaleString('es-AR')}
                  </h2>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={8} md={6} className="mb-3">
              <Card className="h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">
                    <FaCog className="me-2" />
                    Configuración de Deducción Semanal
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <strong>Deducción actual:</strong> ${account.weeklyDeductionAmount?.toLocaleString('es-AR')}
                  </div>
                  <Form onSubmit={handleUpdateWeeklyDeduction}>
                    <Row>
                      <Col md={8}>
                        <Form.Group>
                          <Form.Label>Nuevo monto de deducción semanal</Form.Label>
                          <Form.Control 
                            type="number" 
                            min="0" 
                            value={weeklyDeductionAmount} 
                            onChange={(e) => setWeeklyDeductionAmount(e.target.value)}
                            placeholder="Ingrese el monto"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4} className="d-flex align-items-end">
                        <Button type="submit" variant="primary" className="w-100">
                          <FaCog className="me-2" />
                          Actualizar
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Formularios de transacciones */}
          <Row className="mb-4">
            <Col lg={6} className="mb-4">
              <Card className="h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">
                    <FaShoppingCart className="me-2" />
                    Registrar Compra
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleAddPurchase}>
                    <Form.Group className="mb-3">
                      <Form.Label>Monto</Form.Label>
                      <Form.Control 
                        type="number" 
                        min="0" 
                        step="0.01"
                        value={purchaseAmount} 
                        onChange={(e) => setPurchaseAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Descripción</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={purchaseDesc} 
                        onChange={(e) => setPurchaseDesc(e.target.value)}
                        placeholder="Descripción de la compra"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha</Form.Label>
                      <Form.Control 
                        type="date" 
                        value={purchaseDate} 
                        onChange={(e) => setPurchaseDate(e.target.value)} 
                      />
                    </Form.Group>
                    <Button type="submit" variant="success" className="w-100">
                      <FaShoppingCart className="me-2" />
                      Agregar Compra
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={6} className="mb-4">
              <Card className="h-100">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">
                    <FaMoneyBillWave className="me-2" />
                    Registrar Pago
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleAddPayment}>
                    <Form.Group className="mb-3">
                      <Form.Label>Monto</Form.Label>
                      <Form.Control 
                        type="number" 
                        min="0" 
                        step="0.01"
                        value={paymentAmount} 
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Descripción</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={paymentDesc} 
                        onChange={(e) => setPaymentDesc(e.target.value)}
                        placeholder="Descripción del pago"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha</Form.Label>
                      <Form.Control 
                        type="date" 
                        value={paymentDate} 
                        onChange={(e) => setPaymentDate(e.target.value)} 
                      />
                    </Form.Group>
                    <Button type="submit" variant="primary" className="w-100">
                      <FaMoneyBillWave className="me-2" />
                      Registrar Pago
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Historial de transacciones */}
          <Card>
            <Card.Header className="bg-white">
              <h4 className="mb-0">
                <FaHistory className="me-2" />
                Historial de Transacciones
              </h4>
            </Card.Header>
            <Card.Body>
              {transactions.length === 0 ? (
                <Alert variant="light" className="text-center mb-0">
                  <FaHistory size={30} className="text-muted mb-2" />
                  <div>No hay transacciones registradas</div>
                </Alert>
              ) : (
                <>
                  {/* Vista de escritorio: tabla */}
                  <div className="desktop-view">
                    <div className="table-responsive">
                      <Table striped hover className="mb-0">
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Monto</th>
                            <th>Descripción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map(tx => (
                            <tr key={tx._id}>
                              <td>{new Date(tx.date).toLocaleString('es-AR')}</td>
                              <td>
                                <span className={`badge ${
                                  tx.type === 'purchase' ? 'bg-danger' : 
                                  tx.type === 'payment' ? 'bg-success' : 'bg-info'
                                }`}>
                                  {tx.type === 'purchase' ? 'Compra' : 
                                   tx.type === 'payment' ? 'Pago' : 'Deducción Nómina'}
                                </span>
                              </td>
                              <td className={`fw-bold ${
                                tx.type === 'purchase' ? 'text-danger' : 'text-success'
                              }`}>
                                {tx.type === 'purchase' ? '-' : '+'}${tx.amount?.toLocaleString('es-AR')}
                              </td>
                              <td>{tx.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>

                  {/* Vista móvil: tarjetas */}
                  <div className="mobile-view">
                    {transactions.map(tx => {
                      const typeText = tx.type === 'purchase' ? 'Compra' : tx.type === 'payment' ? 'Pago' : 'Deducción Nómina';
                      const typeVariant = tx.type === 'purchase' ? 'danger' : tx.type === 'payment' ? 'success' : 'info';
                      const amountSign = tx.type === 'purchase' ? '-' : '+';
                      const amountClass = tx.type === 'purchase' ? 'text-danger' : 'text-success';
                      const amountNode = (
                        <span className={`amount-value ${amountClass}`}>{`${amountSign}$${tx.amount?.toLocaleString('es-AR')}`}</span>
                      );
                      return (
                        <MobileCard
                          key={tx._id}
                          title={typeText}
                          subtitle={new Date(tx.date).toLocaleString('es-AR')}
                          badges={[{ text: typeText, variant: typeVariant }]}
                          fields={[
                            { label: 'Monto', value: amountNode },
                            { label: 'Descripción', value: tx.description || '-' }
                          ]}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default EmployeeAccountPage;