import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { FaUsers, FaChartLine, FaExclamationTriangle, FaClock, FaFileInvoiceDollar, FaWallet, FaSignOutAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { BRAND_NAME, BRAND_LOGO_PATH } from '../../config/branding';

const NavbarComponent = ({ isAuthenticated, logout }) => {
  const [logoOk, setLogoOk] = useState(true);

  return (
    <Navbar bg="light" variant="light" expand="lg" className="shadow-sm border-b border-slate-200/70">
      <Container className="py-1 px-2 md:px-4">
        <Navbar.Brand as={Link} to="/" className="font-semibold tracking-tight text-slate-700">
          {logoOk ? (
            <img
              src={BRAND_LOGO_PATH}
              alt={BRAND_NAME}
              width={22}
              height={22}
              className="me-2 rounded shadow-sm align-middle"
              onError={() => setLogoOk(false)}
            />
          ) : (
            <FaUsers className="me-2" />
          )}
          {BRAND_NAME}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto text-sm">
            {isAuthenticated ? (
              <>
                <Nav.Link as={NavLink} to="/" end className={({ isActive }) => `inline-flex items-center gap-2 px-3 py-1 rounded-full ${isActive ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'}`}>
                  {({ isActive }) => (<>
                    <FaChartLine size={isActive ? 18 : 16} className="shrink-0 me-2" />
                    <span>Dashboard</span>
                  </>)}
                </Nav.Link>
                <Nav.Link as={NavLink} to="/employees" className={({ isActive }) => `inline-flex items-center gap-2 px-3 py-1 rounded-full ${isActive ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'}`}>
                  {({ isActive }) => (<>
                    <FaUsers size={isActive ? 18 : 16} className="shrink-0 me-2" />
                    <span>Empleados</span>
                  </>)}
                </Nav.Link>
                <Nav.Link as={NavLink} to="/disciplinary" className={({ isActive }) => `inline-flex items-center gap-2 px-3 py-1 rounded-full ${isActive ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'}`}>
                  {({ isActive }) => (<>
                    <FaExclamationTriangle size={isActive ? 18 : 16} className="shrink-0 me-2" />
                    <span>Medidas Disciplinarias</span>
                  </>)}
                </Nav.Link>
                <Nav.Link as={NavLink} to="/attendance" className={({ isActive }) => `inline-flex items-center gap-2 px-3 py-1 rounded-full ${isActive ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'}`}>
                  {({ isActive }) => (<>
                    <FaClock size={isActive ? 18 : 16} className="shrink-0 me-2" />
                    <span>Asistencias</span>
                  </>)}
                </Nav.Link>
                <Nav.Link as={NavLink} to="/payroll" className={({ isActive }) => `inline-flex items-center gap-2 px-3 py-1 rounded-full ${isActive ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'}`}>
                  {({ isActive }) => (<>
                    <FaFileInvoiceDollar size={isActive ? 18 : 16} className="shrink-0 me-2" />
                    <span>Recibos</span>
                  </>)}
                </Nav.Link>
                <Nav.Link as={NavLink} to="/employee-account" className={({ isActive }) => `inline-flex items-center gap-2 px-3 py-1 rounded-full ${isActive ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-50'}`}>
                  {({ isActive }) => (<>
                    <FaWallet size={isActive ? 18 : 16} className="shrink-0 me-2" />
                    <span>Cuenta Corriente</span>
                  </>)}
                </Nav.Link>
                <Button variant="outline-dark" onClick={logout} className="ms-2 shadow-sm rounded-full px-3 py-1">
                  <FaSignOutAlt className="me-2" />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login" className="px-2 py-1 hover:bg-slate-50 rounded-md">
                  <FaSignInAlt className="me-2" />
                  Iniciar Sesión
                </Nav.Link>
                <Nav.Link as={NavLink} to="/register" className="px-2 py-1 hover:bg-slate-50 rounded-md">
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