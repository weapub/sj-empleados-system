import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Badge } from 'react-bootstrap';
import { FaEdit, FaTrash, FaEye, FaPlus } from 'react-icons/fa';
import { getAllDisciplinaries, deleteDisciplinary } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import DocumentViewerModal from '../common/DocumentViewerModal';

const DisciplinaryList = () => {
  const [disciplinaries, setDisciplinaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDisciplinaries();
  }, []);

  const loadDisciplinaries = async () => {
    try {
      setLoading(true);
      const response = await getAllDisciplinaries();
      setDisciplinaries(response);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar medidas disciplinarias:', error);
      setLoading(false);
    }
  };

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
          await deleteDisciplinary(id);
          Swal.fire('Eliminado', 'La medida disciplinaria ha sido eliminada', 'success');
          loadDisciplinaries();
        } catch (error) {
          console.error('Error al eliminar:', error);
          Swal.fire('Error', 'No se pudo eliminar la medida disciplinaria', 'error');
        }
      }
    });
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'verbal':
        return 'warning';
      case 'formal':
        return 'primary';
      case 'grave':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'verbal':
        return 'Verbal';
      case 'formal':
        return 'Formal';
      case 'grave':
        return 'Grave';
      default:
        return type;
    }
  };

  const [viewerUrl, setViewerUrl] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const openViewer = (url) => {
    setViewerUrl(url);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerUrl(null);
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Medidas Disciplinarias</h2>
        <Button 
          variant="primary" 
          onClick={() => navigate('/disciplinary/new')}
        >
          <FaPlus className="me-1" /> Nueva Medida
        </Button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Tipo</th>
              <th>Días suspensión</th>
              <th>Reincorporación</th>
              <th>Firmado</th>
              <th>Fecha de Firma</th>
              <th>Documento</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {disciplinaries.length > 0 ? (
              disciplinaries.map((disciplinary) => (
                <tr key={disciplinary._id}>
                  <td>
                    {disciplinary.employee ? 
                      `${disciplinary.employee.nombre} ${disciplinary.employee.apellido} (${disciplinary.employee.legajo})` : 
                      'Empleado no disponible'}
                  </td>
                  <td>{formatDate(disciplinary.date)}</td>
                  <td>{disciplinary.time || '-'}</td>
                  <td>
                    <Badge bg={getBadgeColor(disciplinary.type)}>
                      {getTypeText(disciplinary.type)}
                    </Badge>
                  </td>
                  <td>{disciplinary.durationDays ?? '-'}</td>
                  <td>{disciplinary.returnToWorkDate ? formatDate(disciplinary.returnToWorkDate) : '-'}</td>
                  <td>{disciplinary.signed ? 'Sí' : 'No'}</td>
                  <td>{disciplinary.signedDate ? formatDate(disciplinary.signedDate) : '-'}</td>
                  <td>
                    {disciplinary.document ? (
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => openViewer(disciplinary.document)}
                      >
                        <FaEye /> Ver
                      </Button>
                    ) : (
                      'No disponible'
                    )}
                  </td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => navigate(`/disciplinary/edit/${disciplinary._id}`)}
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(disciplinary._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
                  No hay medidas disciplinarias registradas
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
      <DocumentViewerModal 
        show={viewerOpen}
        onHide={closeViewer}
        url={viewerUrl}
        title="Documento de medida disciplinaria"
      />
    </Container>
  );
};

export default DisciplinaryList;