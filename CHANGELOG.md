# Changelog

## v0.2.2 – SJ-Empleados

### Features
- Presentismo: el selector de mes se mueve al modal de previsualización, con botón “Actualizar previsualización”.
- El modal inicia siempre con el mes actual (`YYYY-MM`) y usa ese mes para previsualizar y enviar.
- Envío por WhatsApp desde el modal: se abre `wa.me` con el mensaje generado y el número configurado.
- Selector de destinatario en el modal: lista números activos desde BD con nombre/rol cuando están disponibles; fallback a `PRESENTISMO_WHATSAPP_TO`.

### Fixes
- Previsualización en producción (Vercel): se corrige `ReferenceError` incluyendo el arreglo `recipients` en la respuesta del backend.

### Updates
- Vite: `server.port=5178` y `strictPort=true` para ejecutar siempre en el puerto 5178.

### Post-release
- Configurar destinatarios en “Administración → Destinatarios de Presentismo” o mediante `PRESENTISMO_WHATSAPP_TO`.
- Validar en Dashboard que “Previsualizar envío por WhatsApp” muestra el selector de mes y destinatario, y que “Enviar por WhatsApp” abre el número elegido con el texto correcto.

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