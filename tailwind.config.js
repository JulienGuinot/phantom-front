/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          dark: '#4F46E5',
        },
        dark: {
          DEFAULT: '#0A0F1E',
          light: '#1F2937',
        }
      },
      animation: {
        'encryption': 'encryption 2s ease-in-out infinite',
      },
      keyframes: {
        encryption: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [],
};