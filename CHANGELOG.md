# Changelog

## v0.2.1 – SJ-Empleados

### Features
- Endpoint de desarrollo para promover usuario a admin: `GET/POST /api/admin/promote-admin-dev`.
- Scripts auxiliares: `backend/scripts/promoteAdmin.js` (promoción por CLI) y `backend/scripts/callPromoteDev.js` (llamada HTTP local).

### Security
- Endpoint deshabilitado en producción; requiere header `x-admin-promote-token` y usa `ADMIN_PROMOTE_TOKEN` (fallback `DEV_PROMOTE`).

### Post-release
- Rotar el token de promoción en entornos de desarrollo si fuera necesario.
- Eliminar archivos temporales usados en pruebas (ej. `tmp_promote.json`).

## v0.2.0 – SJ-Empleados

### Features
- Configuración de destinatarios para el informe de presentismo desde el panel (CRUD completo: crear, editar, activar/desactivar y eliminar).
- Nuevo modelo `PresentismoRecipient` en backend.
- El envío del informe mensual usa destinatarios activos de BD con fallback a `PRESENTISMO_WHATSAPP_TO` si la base está vacía.

### Updates
- Dashboard: acceso rápido a “Configurar destinatarios Presentismo”.
- API Frontend: nuevas funciones `getPresentismoRecipients`, `createPresentismoRecipient`, `updatePresentismoRecipient`, `deletePresentismoRecipient`.

### Fixes
- Login/Register en móvil: altura dinámica con `--app-dvh` para evitar que el teclado cubra los campos; vista completa sin scroll.

### Notas técnicas
- Se recomienda cargar teléfonos en formato E.164 (con prefijo país, ej. `+54911...`).
- Si no hay destinatarios en BD, el backend usa `PRESENTISMO_WHATSAPP_TO` (variables de entorno) como fallback.

### Post-release
- Validar el envío del informe como usuario admin y que los números configurados reciban el WhatsApp.
- Verificar la ejecución del cron mensual si está habilitado.

## v0.1.0 – SJ-Empleados

### Fixes
- Vista móvil de asistencias: migración a `react-window` `FixedSizeList` y `width` numérico medido por contenedor. Soluciona `TypeError: Cannot convert undefined or null to object` observado en `react-window.js` y `vendor-react-*.js`.
- Robustez en carga de empleados: el frontend acepta respuesta tipo `Array` o paginada `{ data, total, page, totalPages }`.

### Updates
- Tailwind CSS actualizado a v4 con ajustes menores.
- Configuración de Vite (rolldown): se recomienda `@vitejs/plugin-react-oxc` para mejor performance (opcional).

### CI/Deploy
- Workflows GitHub Actions verificados:
  - `deploy-frontend.yml` para producción (push a `main`)
  - `deploy-frontend-preview.yml` para previews (PRs hacia `main`)

### Post-release
- Verificar `/attendance` en móvil: render estable, scroll ok, sin errores en consola.
- Validar filtros/orden/paginación en escritorio y móvil.

### Notas técnicas
- `react-window` requiere `width` numérico en `FixedSizeList`. Evitar strings tipo `"100%"`; medir el contenedor y pasar un número.
- Si el ancho difiere entre dispositivos, usar `ResizeObserver` para recalcular.