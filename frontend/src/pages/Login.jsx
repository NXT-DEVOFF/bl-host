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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">BL-Host</h1>
        <p className="text-gray-600 text-center mb-6">Panneau de serveurs de jeu</p>

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