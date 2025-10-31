/**
 * Middleware para manejar errores de subida de archivos con Cloudinary
 * Convierte errores HTML de multer/cloudinary en respuestas JSON consistentes
 */

const handleUploadError = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error('Error en subida de archivo:', err);
        
        // Si es un error de Cloudinary (credenciales faltantes)
        if (err.message && err.message.includes('Must supply api_key')) {
          return res.status(500).json({
            msg: 'Cloudinary no está configurado correctamente (faltan credenciales).'
          });
        }
        
        // Si es un error de tipo de archivo no permitido
        if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.message.includes('file type')) {
          return res.status(400).json({
            msg: 'Tipo de archivo no permitido. Solo se permiten: PNG, JPG, JPEG, PDF, DOC, DOCX.'
          });
        }
        
        // Si es un error de tamaño de archivo
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            msg: 'El archivo es demasiado grande. Tamaño máximo permitido: 10MB.'
          });
        }
        
        // Error genérico de subida
        return res.status(500).json({
          msg: 'Error al subir el archivo. Inténtalo de nuevo.'
        });
      }
      
      // Si no hay error, continúa con el siguiente middleware
      next();
    });
  };
};

module.exports = { handleUploadError };