/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pesach: {
          50: '#fdf8f0',
          100: '#f9edd9',
          200: '#f2d7b0',
          300: '#e9bc7e',
          400: '#df9b4e',
          500: '#d6802e',
          600: '#c56823',
          700: '#a4501f',
          800: '#854120',
          900: '#6c371d',
        },
      },
      fontFamily: {
        hebrew: ['Rubik', 'Heebo', 'Assistant', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
