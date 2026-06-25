import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const res = await authService.getCurrentUser();
        setUser(res.data.user);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        // Repli sur l'utilisateur stocké localement à la connexion
        const userJson = localStorage.getItem('user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="loading-spinner mx-auto h-10 w-10 text-primary"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Impossible de charger le profil. Veuillez vous reconnecter.</p>
          <button
            onClick={() => navigate('/login')}
            className="btn-secondary mt-4"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Profil
        </h1>
        <button
          onClick={() => navigate('/')}
          className="btn-link hover:text-primary-dark dark:hover:text-primary"
        >
          Retour au tableau de bord
        </button>
      </div>

      <div className="card-pro">
        <div className="flex items-center p-6">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 flex items-center justify-center bg-primary-dark/10 text-primary-dark rounded-full text-lg font-semibold">
              {user.email.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {user.email}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Rôle : {user.role || 'user'}
            </p>
            {user.createdAt && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Inscrit depuis : {new Date(user.createdAt).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleLogout}
          className="w-full btn-danger py-3"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
};

export default Profile;
