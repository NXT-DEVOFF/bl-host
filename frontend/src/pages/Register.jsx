import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { validatePassword } from '../utils/validators';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validatePassword(password)) {
      setError('Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule et un chiffre.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    try {
      await authService.register(email, password);
      // Redirige vers la connexion après une inscription réussie
      navigate('/login');
    } catch (err) {
      // L'intercepteur Axios renvoie le corps { success, error: { message } }
      setError(err.error?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-animated-gradient p-4 overflow-hidden">
      {/* Bulles décoratives en arrière-plan */}
      <div className="blob bg-violet-400/40 h-72 w-72 -top-10 -right-10" />
      <div className="blob bg-indigo-300/40 h-80 w-80 bottom-0 left-0" style={{ animationDelay: '4s' }} />
      <div className="blob bg-emerald-300/30 h-64 w-64 top-1/4 right-1/4" style={{ animationDelay: '8s' }} />

      <div className="relative w-full max-w-md space-y-8 p-8 rounded-2xl glass-card animate-scale-in">
        <div className="text-center animate-fade-in-down">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-float">
            <svg className="h-9 w-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mt-4 text-gradient">
            BL-Host Panel
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Créez votre compte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-pro"
              placeholder="votre@email.com"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-pro"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Au moins 8 caractères, une majuscule, une minuscule et un chiffre.
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmez le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-pro"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 dark:bg-red-900 dark:text-red-400 p-4 rounded-md text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <span className="loading-spinner mr-2"></span>
                Inscription...
              </>
            ) : (
              'S\'inscrire'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Déjà un compte?{' '}
            <span className="text-primary hover:text-primary-dark dark:hover:text-primary cursor-pointer" onClick={() => navigate('/login')}>
              Connectez-vous
            </span>
          </p>
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
          © {new Date().getFullYear()} BL-Host. Tous droits réservés.
        </div>
      </div>
    </div>
  );
};

export default Register;