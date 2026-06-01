/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdfb',
          100: '#ccfcf5',
          200: '#99f6eb',
          300: '#5eecde',
          400: '#2dd4c9',
          500: '#1DB8A8',
          600: '#3BA89F',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        gold: {
          300: '#fcd34d',
          400: '#f0b429',
          500: '#e0a000',
          600: '#c78a00',
          700: '#a37000',
        },
        sand: {
          50:  '#fdfaf5',
          100: '#f9f2e3',
          200: '#f0e2c2',
          300: '#e3c88e',
          400: '#d4a95c',
        },
        dark: {
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#080d1a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0f766e 0%, #1DB8A8 50%, #3BA89F 100%)',
        'gold-gradient': 'linear-gradient(135deg, #f0b429 0%, #e0a000 100%)',
      },
      boxShadow: {
        'glow':       '0 0 20px rgba(29, 184, 168, 0.3)',
        'gold-glow':  '0 0 20px rgba(224, 160, 0, 0.4)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out both',
      },
      keyframes: {
        fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:  { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeInUp: { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
