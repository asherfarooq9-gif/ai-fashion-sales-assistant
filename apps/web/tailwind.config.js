/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1b1b1f',
        blush: {
          50: '#fdf2f5',
          100: '#fce7ec',
          300: '#f4a9bd',
          500: '#e35d84',
          600: '#cf436e',
          700: '#a83055',
        },
        sand: '#f7f4ef',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
