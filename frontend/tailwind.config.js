/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {}
  },
  // Activamos preflight para aplicar estilos base a todos los elementos
  corePlugins: {
    preflight: true
  }
};