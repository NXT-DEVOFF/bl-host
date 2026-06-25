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
        success: '#10b981',
        danger: '#ef4444',
        'danger-dark': '#dc2626',
        warning: '#f59e0b',
        'warning-dark': '#d97706',
        info: '#3b82f6',
        'info-dark': '#2563eb',
        // Couleurs sémantiques (référencées dans index.css via @apply)
        dark: '#1e293b',
        background: '#ffffff',
        'background-dark': '#0f172a',
        'card-bg': '#ffffff',
        'card-bg-dark': '#1e293b',
        border: '#e2e8f0',
        'border-dark': '#475569',
        'text-primary': '#1e293b',
        'text-primary-dark': '#f8fafc',
        'text-secondary': '#64748b',
        'text-secondary-dark': '#94a3b8',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}