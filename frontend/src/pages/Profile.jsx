import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
        // In a real app, we would fetch the user from the backend
        // For now, we'll get it from localStorage
        const userJson = localStorage.getItem('user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        } else {
          // Fetch from backend if not in localStorage
          const res = await axios.get('http://localhost:5000/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data.user);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="loading-spinner mx-auto h-10 w-10 text-primary"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Unable to load profile. Please log in again.</p>
          <button
            onClick={() => navigate('/login')}
            className="btn-secondary mt-4"
          >
            Log in
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
        <navigate
          to="/servers"
          className="btn-link hover:text-primary-dark dark:hover:text-primary"
        >
          Retour aux serveurs
        </navigate>
      </div>

      <div className="card-pro">
        <div className="flex items-center p-6">
          <div className="flex-shrink-0">
            <div className="h-12 w-12 flex items-center justify-center bg-primary-dark/10 text-primary-dark rounded-full">
              {user.email.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {user.email}
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Utilisateur enregistré depuis: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          Paramètres du compte
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Notification par email
            </span>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={true}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded dark:border-gray-600"
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Notification poussée
            </span>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={false}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded dark:border-gray-600"
              />
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Authentification à deux facteurs
            </span>
            <button
              className="btn-link hover:text-primary-dark dark:hover:text-primary p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Configurer
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          }}
          className="w-full btn-danger py-3"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
};

export default Profile;