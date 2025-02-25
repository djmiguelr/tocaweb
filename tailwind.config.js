/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF4D00', // Color naranja de Olímpica
        'primary-hover': '#FF6B2C',
        dark: {
          DEFAULT: '#1C1C1C',
          secondary: '#2C2C2C',
        }
      },
      container: {
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1440px',
        },
      }
    },
  },
  plugins: [],
} 