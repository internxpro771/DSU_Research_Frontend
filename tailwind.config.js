/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dsu: {
          maroon: '#4A1525',
          'maroon-light': '#6B2040',
          'maroon-hover': '#5A1A30',
          gold: '#C9A961',
          'gold-light': '#D4B87A',
        },
      },
      fontFamily: {
        heading: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
