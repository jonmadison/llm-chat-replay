/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'libre': ['"Libre Franklin"', 'sans-serif'],
      },
      borderRadius: {
        'chat': '1.5rem',
      }
    },
  },
  plugins: [],
}