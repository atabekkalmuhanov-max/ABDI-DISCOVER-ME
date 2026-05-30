/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff4ff',
          100: '#dce5ff',
          200: '#bfceff',
          300: '#93abff',
          400: '#6380ff',
          500: '#3d56f5',
          600: '#2738e8',
          700: '#1f2ab8',
          800: '#1c2590',
          900: '#1a2170',
          950: '#10143f',
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
        'hero-gradient': 'linear-gradient(135deg, #1a2170 0%, #2738e8 50%, #1f2ab8 100%)',
        'gold-gradient': 'linear-gradient(135deg, #f0b429 0%, #e0a000 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(63, 86, 245, 0.3)',
        'gold-glow': '0 0 20px rgba(224, 160, 0, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
