# Guía de instalación para otras entidades

Esta guía permite reutilizar SJ-Empleados en otras organizaciones.

## 1) Preparar el repositorio
- Opción A: Descargar el release `v0.2.2` desde GitHub (ZIP) y descomprimir.
- Opción B: Hacer fork del repositorio y clonar.

Estructura relevante:
- `frontend/` (React + Vite)
- `backend/` (Express + MongoDB)

## 2) Backend (Render/Koyeb/Railway)
**Directorio**: `backend`

Variables de entorno mínimas:
- `MONGO_URI` → cadena de conexión de MongoDB Atlas.
- `JWT_SECRET` → secreto fuerte para firmar tokens.
- `CORS_ORIGIN` → dominios permitidos del frontend (ej: `https://tu-app.vercel.app`).
- Opcional: `CORS_ORIGIN_PATTERNS` → patrones con comodines (ej: `https://*.vercel.app`).
- Opcional: `CLOUDINARY_URL` o `CLOUDINARY_*` si vas a subir archivos a CDN.
- Opcional: `PRESENTISMO_WHATSAPP_TO` → números por defecto separados por coma si no usas BD.

Despliegue rápido:
- Build: `npm install`
- Start: `npm start`

Pruebas:
- `GET /` debe responder `SJ-Empleados API OK`.
- `GET /api/_debug/routes` lista las rutas.

## 3) Frontend (Vercel)
**Directorio**: `frontend`

Variables de entorno:
- `VITE_API_URL` → URL base pública del backend (sin `/api`).

Build:
- `npm install && npm run build`
- Output: `dist/`

Configuración recomendada:
- `vite.config.js` fija el puerto local `5178` para desarrollo (`strictPort: true`).
- `vercel.json` define build estática y rewrites SPA.

## 4) Configurar destinatarios de Presentismo
- En el panel: “Administración → Destinatarios de Presentismo”.
- Crear registros con `name`, `roleLabel`, `phone` y marcar `active`.
- Formato de teléfono sugerido: E.164 con prefijo país (ej: `+54911...`).
- Si la base está vacía, el backend usa `PRESENTISMO_WHATSAPP_TO` como fallback.

## 5) Flujo de informe de Presentismo
- En Dashboard, “Previsualizar envío por WhatsApp” abre un modal.
- Seleccionar el **mes** y usar “Actualizar previsualización” para refrescar.
- Elegir el **destinatario** (lista de BD o variables de entorno).
- “Enviar por WhatsApp” abre `wa.me` con el mensaje y número elegido.

## 6) Usuarios y administración
- Crear admin en producción mediante un seed personalizado o usando el endpoint dev solo en entornos controlados.
- Endpoint dev (no producción): `GET/POST /api/admin/promote-admin-dev` con header `x-admin-promote-token`.
- Script CLI: `backend/scripts/promoteAdmin.js`.

## 7) Seguridad y CORS
- Limitar CORS a dominios de frontend.
- No exponer secretos en el frontend (`VITE_*` son públicos).

## 8) Checklist de adopción
- Backend desplegado y accesible por HTTPS.
- Frontend desplegado en Vercel con `VITE_API_URL` correcto.
- Destinatarios de Presentismo configurados.
- Validada la previsualización y apertura de WhatsApp desde el Dashboard.