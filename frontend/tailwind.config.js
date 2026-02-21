// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'casa-red': '#5b0e0e',
        'casa-green': '#0f3b1c',
        'casa-gray': '#1a1a1a',
        'casa-black': '#0a0a0a',
      }
    },
  },
  plugins: [],
}
