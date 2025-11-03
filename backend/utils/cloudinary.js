const cloudinary = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configurar Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Aviso temprano si faltan credenciales
(() => {
  const missing = [];
  if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');
  if (!process.env.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
  if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');
  if (missing.length) {
    console.warn(`[Cloudinary] Faltan variables de entorno: ${missing.join(', ')}. Las cargas fallarán hasta configurarlas.`);
  }
})();

// Elegir storage seguro: si faltan credenciales, usar disco para persistir localmente
const hasCreds = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

let storage;
if (hasCreds) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: (req, file) => {
      const mime = file.mimetype;
      const isDoc = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ].includes(mime);
      const timestamp = Date.now();
      const originalName = file.originalname.split('.')[0];
      const format = isDoc
        ? (mime === 'application/pdf'
            ? 'pdf'
            : mime === 'application/msword'
              ? 'doc'
              : 'docx')
        : undefined;

      return {
        folder: 'empleados-app', // Carpeta en Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
        type: 'upload', // Forzar tipo de entrega estándar
        access_mode: 'public', // Asegurar acceso público
        resource_type: isDoc ? 'raw' : 'image', // PDFs/Docs como raw; imágenes como image
        public_id: `${originalName}-${timestamp}`,
        // Para recursos raw, especificar formato asegura que la URL incluya la extensión
        ...(format ? { format } : {}),
      };
    },
  });
} else {
  console.warn('[Cloudinary] Sin credenciales: usando almacenamiento local en \'/uploads\'');
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (e) {
    console.error('[Uploads] No se pudo crear la carpeta uploads:', e.message);
  }
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const safeBase = (file.originalname || 'file')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/\s+/g, '_');
      // Mantener extensión original
      const ext = path.extname(safeBase) || getExtFromMime(file.mimetype);
      const base = path.basename(safeBase, path.extname(safeBase));
      cb(null, `${base}-${timestamp}${ext}`);
    },
  });
}

// Configurar Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

// Mapear mime a extensión cuando falte
function getExtFromMime(mime) {
  const map = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  };
  return map[mime] || '';
}

// Extraer public_id a partir de la URL completa de Cloudinary
const extractPublicIdFromUrl = (url) => {
  try {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean);
    // Estructura típica: /<cloud_name>/<resource_type>/upload/v<version>/<folder>/<public_id>.<ext>
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    // Saltar 'upload' y 'v<version>'
    const publicParts = parts.slice(uploadIndex + 2);
    if (publicParts.length === 0) return null;
    // Quitar la extensión del último segmento
    const last = publicParts[publicParts.length - 1];
    const withoutExt = last.replace(/\.[^/.]+$/, '');
    publicParts[publicParts.length - 1] = withoutExt;
    // Incluir carpeta si existe
    return publicParts.join('/');
  } catch (_) {
    return null;
  }
};

// Función para eliminar archivo de Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    // Intentar eliminar como imagen primero
    let result = await cloudinary.v2.uploader.destroy(publicId);
    // Si no se encuentra, intentar como recurso raw (documentos)
    if (!result || result.result === 'not found') {
      result = await cloudinary.v2.uploader.destroy(publicId, { resource_type: 'raw' });
    }
    return result;
  } catch (error) {
    console.error('Error eliminando archivo de Cloudinary:', error);
    throw error;
  }
};

// Función para obtener URL optimizada
const getOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.v2.url(publicId, {
    quality: 'auto',
    fetch_format: 'auto',
    ...options
  });
};

module.exports = {
  cloudinary,
  upload,
  deleteFromCloudinary,
  getOptimizedUrl,
  extractPublicIdFromUrl
};