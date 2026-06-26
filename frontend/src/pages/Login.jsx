import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, Input, Error, Success } from '../components/UI';
import authService from '../services/authService';
import { validateEmail } from '../utils/validators';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage({ type: '', text: '' });

    // Validation
    const newErrors = {};
    if (!email) newErrors.email = 'L\'email est requis';
    else if (!validateEmail(email)) newErrors.email = 'Email invalide';
    if (!password) newErrors.password = 'Le mot de passe est requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setMessage({ type: 'success', text: 'Connexion réussie !' });
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.error?.message || 'Échec de la connexion'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-animated-gradient flex items-center justify-center p-4 overflow-hidden">
      {/* Bulles décoratives en arrière-plan */}
      <div className="blob bg-violet-400/40 h-72 w-72 -top-10 -left-10" />
      <div className="blob bg-indigo-300/40 h-80 w-80 bottom-0 right-0" style={{ animationDelay: '4s' }} />
      <div className="blob bg-emerald-300/30 h-64 w-64 top-1/3 left-1/4" style={{ animationDelay: '8s' }} />

      <Card className="relative w-full max-w-md glass-card animate-scale-in">
        <div className="flex flex-col items-center mb-6 animate-fade-in-down">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-float">
            <svg className="h-9 w-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-center mt-4 text-gradient">BL-Host</h1>
          <p className="text-gray-600 text-center text-sm mt-1">Panneau de serveurs de jeu</p>
        </div>

        {message.text && (
          message.type === 'error' ?
            <Error message={message.text} /> :
            <Success message={message.text} />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="admin@blhost.com"
          />

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="Entrez votre mot de passe"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-4 text-sm">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Inscrivez-vous
          </Link>
        </p>

        <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200 text-sm text-blue-700">
          <strong>Identifiants de démonstration :</strong><br />
          Email : admin@blhost.com<br />
          Mot de passe : admin123
        </div>
      </Card>
    </div>
  );
};

export default Login;