# Changelog

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