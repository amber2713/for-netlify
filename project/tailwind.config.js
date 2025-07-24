/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'cambria': ['Georgia', 'Times New Roman', 'serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      textShadow: {
        'glow': '0 0 10px rgba(255, 255, 255, 0.5), 2px 2px 4px rgba(0, 0, 0, 0.8)',
      }
    },
  },
  plugins: [],
};