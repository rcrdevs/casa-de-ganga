/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'ganga-black': '#050505',
        'ganga-gray': '#2a2a2a',
        'ganga-light': '#e5e5e5',
        'ganga-white': '#ffffff',
        'ganga-red': '#3a0202',
        'ganga-red-light': '#5e0a0a',
      },
      fontFamily: {
        // Fontes elegantes e 100% legíveis
        'title': ['"Cinzel Decorative"', 'serif'], 
        'body': ['"Space Grotesk"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}