# Manual de Uso — SJ-Empleados

Guía paso a paso para operar el sistema en producción y desarrollo.

- URL producción: `https://sj-empleados.vercel.app/`
- URL backend (ejemplo): `https://sj-empleados-system.onrender.com`
- Soporte: revisar `DEPLOY.md` y `docs/instalacion-otras-entidades.md`.

## 1. Acceso y Autenticación
- Ingresá a `https://sj-empleados.vercel.app/`.
- Inicia sesión con tu email y contraseña.
- El sistema utiliza JWT; las páginas protegidas requieren sesión activa.
- Cierre de sesión desde el menú de usuario.

## 2. Dashboard (Panel Principal)
- Visualiza métricas y accesos rápidos.
- Accesos clave:
  - Asistencias.
  - Presentismo por WhatsApp.
  - Administración de empleados y destinatarios.

## 3. Presentismo por WhatsApp
Flujo para armar el informe y abrir WhatsApp con texto preformateado.

1) Abrir el modal desde el Dashboard → “Previsualizar envío por WhatsApp”.
2) Seleccionar mes (`YYYY-MM`). Por defecto se sugiere el mes actual.
3) Elegir destinatario:
   - Destinatarios cargados en Administración (nombre, rol y teléfono), o
   - Fallback de `PRESENTISMO_WHATSAPP_TO` si no hay registrados en BD.
4) Usar “Actualizar previsualización” si cambiaste el mes.
5) Revisar el texto generado.
6) “Enviar por WhatsApp” abre una nueva pestaña `wa.me/<numero>?text=<mensaje>`.

Notas:
- Si no hay destinatarios, el modal te avisará.
- El sistema normaliza números (recomendado guardar con `+54...`).

## 4. Administración de Destinatarios de Presentismo
- Accedé a “Administración → Destinatarios de Presentismo”.
- Cargá o editá:
  - Nombre y rol (para identificación).
  - Teléfono (con código de país) a quien enviar el informe.
- Activá los que quieras usar.
- Estos se verán como opciones en el modal de Presentismo.

## 5. Gestión de Empleados
- Alta, edición, baja y consulta de empleados.
- Campos principales: datos personales, teléfono, estado laboral.
- Búsqueda y filtros disponibles.

## 6. Asistencias
- Registrar, editar y consultar asistencias.
- Vistas por día/mes con filtros y orden.
- En móviles, render estable sin “virtualización” problemática.

## 7. Medidas Disciplinarias
- Alta/edición de medidas.
- Adjuntos almacenados en Cloudinary.
- Notificación por WhatsApp (opcional) si el empleado tiene teléfono.

## 8. Recibos y Cuenta del Empleado
- Consulta de recibos (`PayrollReceipt`).
- Movimientos de cuenta y saldos (`EmployeeAccount`).

## 9. Administración de Usuarios
- Promoción de administradores y scripts útiles:
  - Ver `backend/scripts/` para tareas de administración (promoteAdmin, migrateDb, seedLocal).

## 10. Configuración (Variables de Entorno)
Frontend (Vercel):
- `VITE_API_URL` → URL base del backend (sin `/api`).

Backend (Render/Railway/Koyeb):
- `MONGO_URI` → conexión a MongoDB Atlas.
- `JWT_SECRET` → secreto fuerte.
- `CORS_ORIGIN` → dominio del frontend (puede ser lista separada por comas).
- Opcional: `CLOUDINARY_URL` o `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Opcional: Twilio para WhatsApp (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`).

## 11. WhatsApp y Twilio (Opcional)
- El frontend abre WhatsApp con `wa.me`.
- El backend puede enviar WhatsApp vía Twilio:
  - En asistencias y medidas disciplinarias.
- Para pruebas, usar el Sandbox de Twilio (ver DEPLOY.md).

## 12. CI/CD y Deploy
- Frontend: Vercel con deploy automático desde GitHub.
- Backend: Render/Railway/Koyeb.
- Workflows en `.github/workflows/` para producción y previews.

## 13. Diagnóstico Rápido
- Dashboard funciona pero falla métrica: `net::ERR_ABORTED /api/dashboard/metrics` → conocido, no afecta Presentismo.
- Si WhatsApp no abre:
  - Verificar destinatario seleccionado y formato del número.
  - Revisar que el backend devuelva `recipients` en preview (fix v0.2.2 aplicado).
- Si API falla con CORS:
  - Confirmar `CORS_ORIGIN` y `CORS_ORIGIN_PATTERNS`.
  - Validar `VITE_API_URL` (sin `/api`).

## 14. Buenas Prácticas
- Teléfonos con `+54...` para compatibilidad.
- No subir `.env` reales al repo.
- Usar Cloudinary para adjuntos (evita filesystem efímero).
- Mantener `main` como rama productiva.

## 15. Glosario
- Presentismo: informe mensual de asistencia/regularidad.
- Destinatario: persona/rol que recibe el mensaje de Presentismo.
- `wa.me`: esquema de WhatsApp para abrir conversaciones con texto predefinido.
- Twilio: servicio de mensajería (WhatsApp Business).

---
Para personalizar el texto del Presentismo (saludo, firma, estructura), indicá las preferencias y lo parametrizamos en Administración.