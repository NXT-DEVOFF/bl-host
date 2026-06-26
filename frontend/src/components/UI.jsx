import React from 'react';

export const Card = ({ children, className = '', hover = false }) => (
  <div
    className={`
      bg-white rounded-xl shadow-sm border border-gray-100 p-6
      transition-all duration-300
      ${hover ? 'card-hover cursor-pointer' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-indigo-500/20',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200',
    danger: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-red-500/20',
    success: 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-emerald-500/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`
        relative inline-flex items-center justify-center gap-2
        font-medium rounded-lg shadow-sm btn-shine
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:shadow-md active:scale-[0.97] cursor-pointer'}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {loading ? 'Chargement...' : children}
    </button>
  );
};

export const Input = ({
  label,
  error,
  type = 'text',
  className = '',
  ...props
}) => (
  <div className="mb-4">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
    )}
    <input
      type={type}
      className={`
        w-full px-3.5 py-2.5 border rounded-lg bg-white
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-400
        ${error
          ? 'border-red-400 focus:ring-red-400/50 focus:border-red-400'
          : 'border-gray-300 hover:border-gray-400'}
        ${className}
      `}
      {...props}
    />
    {error && (
      <span className="block text-red-500 text-sm mt-1 animate-fade-in-down">
        {error}
      </span>
    )}
  </div>
);

export const Badge = ({ children, variant = 'gray' }) => {
  const variants = {
    gray: 'bg-gray-100 text-gray-700 ring-gray-500/20',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-500/30',
    red: 'bg-red-50 text-red-700 ring-red-500/30',
    yellow: 'bg-amber-50 text-amber-700 ring-amber-500/30',
    blue: 'bg-blue-50 text-blue-700 ring-blue-500/30',
  };

  const dot = {
    gray: 'bg-gray-400',
    green: 'bg-emerald-500',
    red: 'bg-red-500',
    yellow: 'bg-amber-500',
    blue: 'bg-blue-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-medium ring-1 ring-inset ${variants[variant]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot[variant]}`} />
      {children}
    </span>
  );
};

export const Loading = () => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <div className="relative h-12 w-12">
      <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
      <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
    </div>
    <span className="text-sm text-gray-500 animate-pulse">Chargement...</span>
  </div>
);

export const Error = ({ message }) => (
  <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-fade-in-down">
    <svg className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
    <span><strong>Erreur :</strong> {message}</span>
  </div>
);

export const Success = ({ message }) => (
  <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg animate-fade-in-down">
    <svg className="h-5 w-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
    <span><strong>Succès :</strong> {message}</span>
  </div>
);

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="h-8 w-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors press"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
