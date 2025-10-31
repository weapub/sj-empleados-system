import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { FaUsers, FaChartLine, FaExclamationTriangle, FaClock, FaFileInvoiceDollar, FaWallet, FaSignOutAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { BRAND_NAME, BRAND_LOGO_PATH } from '../../config/branding';

const NavbarComponent = ({ isAuthenticated, logout }) => {
  const [logoOk, setLogoOk] = useState(true);

  return (
    <Navbar bg="light" variant="light" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          {logoOk ? (
            <img
              src={BRAND_LOGO_PATH}
              alt={BRAND_NAME}
              width={28}
              height={28}
              className="me-2 rounded"
              onError={() => setLogoOk(false)}
            />
          ) : (
            <FaUsers className="me-2" />
          )}
          {BRAND_NAME}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <>
                <Nav.Link as={NavLink} to="/" end>
                  <FaChartLine className="me-2" />
                  Dashboard
                </Nav.Link>
                <Nav.Link as={NavLink} to="/employees">
                  <FaUsers className="me-2" />
                  Empleados
                </Nav.Link>
                <Nav.Link as={NavLink} to="/disciplinary">
                  <FaExclamationTriangle className="me-2" />
                  Medidas Disciplinarias
                </Nav.Link>
                <Nav.Link as={NavLink} to="/attendance">
                  <FaClock className="me-2" />
                  Asistencias
                </Nav.Link>
                <Nav.Link as={NavLink} to="/payroll">
                  <FaFileInvoiceDollar className="me-2" />
                  Recibos
                </Nav.Link>
                <Nav.Link as={NavLink} to="/employee-account">
                  <FaWallet className="me-2" />
                  Cuenta Corriente
                </Nav.Link>
                <Button variant="outline-dark" onClick={logout} className="ms-2">
                  <FaSignOutAlt className="me-2" />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login">
                  <FaSignInAlt className="me-2" />
                  Iniciar Sesión
                </Nav.Link>
                <Nav.Link as={NavLink} to="/register">
                  <FaUserPlus className="me-2" />
                  Registrarse
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;