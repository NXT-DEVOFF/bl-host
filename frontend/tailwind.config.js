/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        'primary-dark': '#4f46e5',
        secondary: '#10b981',
        'secondary-dark': '#059669',
        danger: '#ef4444',
        'danger-dark': '#dc2626',
        warning: '#f59e0b',
        'warning-dark': '#d97706',
        info: '#3b82f6',
        'info-dark': '#2563eb',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}