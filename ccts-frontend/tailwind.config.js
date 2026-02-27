/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gov: {
          DEFAULT: '#0b5ed7',
          light: '#1e6edf',
          dark: '#084bb5',
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          700: '#374151',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial'],
      },
      boxShadow: {
        'soft': '0 6px 18px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: { xl: '12px' }
    },
  },
  plugins: [],
};
