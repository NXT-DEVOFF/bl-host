import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FiTrash2, FiEdit2, FiPlay, FiPause, FiStopCircle } from 'react-icons/fi';

const ServerView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchServer = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/servers/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setServer(res.data);
      } catch (err) {
        console.error('Failed to fetch server:', err);
        setError('Impossible de charger les détails du serveur.');
      } finally {
        setLoading(false);
      }
    };

    fetchServer();
  }, [id]);

  const handleStart = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/servers/${id}/start`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setServer(prev => ({ ...prev, status: 'online' }));
    } catch (err) {
      console.error('Failed to start server:', err);
      setError('Impossible de démarrer le serveur.');
    }
  };

  const handleStop = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/servers/${id}/stop`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setServer(prev => ({ ...prev, status: 'offline' }));
    } catch (err) {
      console.error('Failed to stop server:', err);
      setError('Impossible d\'arrêter le serveur.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce serveur ? Cette action est irréversible.')) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/servers/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      navigate('/servers');
    } catch (err) {
      console.error('Failed to delete server:', err);
      setError('Impossible de supprimer le serveur.');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="loading-spinner mx-auto h-10 w-10 text-primary"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Chargement du serveur...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-500 dark:bg-red-900 dark:text-red-400 p-4 rounded-md mb-6">
          {error}
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Une erreur est survenue lors du chargement du serveur.</p>
          <button
            onClick={() => navigate('/servers')}
            className="btn-secondary"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  if (!server) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Serveur non trouvé.</p>
          <button
            onClick={() => navigate('/servers')}
            className="btn-secondary"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Détails du serveur
        </h1>
        <div className="flex items-center space-x-3">
          <Link
            to={`/servers/${id}/edit`}
            className="btn-link hover:text-primary-dark dark:hover:text-primary"
          >
            <FiEdit2 className="h-4 w-4" />
          </Link>
          <button
            onClick={handleDelete}
            className="btn-link hover:text-red-500 dark:hover:red-400"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="card-pro">
        <div className="card-pro-header">
          <h3 className="card-pro-title">{server.name}</h3>
        </div>
        <div className="card-pro-content space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Jeu
              </p>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {server.game}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Statut
              </p>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                server.status === 'online'
                  ? 'bg-green-100 text-green-800'
                  : server.status === 'offline'
                  ? 'bg-red-100 text-red-800'
                  : server.status === 'starting'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {server.status === 'online' ? (
                  <>
                    <FiPlay className="mr-1 h-4 w-4" />
                    En ligne
                  </>
                ) : server.status === 'offline' ? (
                  <>
                    <FiStopCircle className="mr-1 h-4 w-4 text-red-500" />
                    Hors ligne
                  </>
                ) : server.status === 'starting' ? (
                  <>
                    <FiPlay className="mr-1 h-4 w-4 animate-spin" />
                    Démarrage...
                  </>
                ) : (
                  <>
                    <FiPause className="mr-1 h-4 w-4" />
                    Arrêt...
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="border-t border-border dark:border-border-dark pt-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Description
            </p>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {server.description || 'Aucune description'}
            </p>
          </div>

          <div className="border-t border-border dark:border-border-dark pt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Mémoire RAM
                </p>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {server.memory} MB
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Espace disque
                </p>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {server.disk} MB
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  CPU
                </p>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {server.cpu}%
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border dark:border-border-dark pt-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Ports
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              {server.ports || 'Ports par défaut du jeu'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center space-x-4">
        {server.status === 'online' ? (
          <button
            onClick={handleStop}
            className="btn-danger px-4 py-2"
          >
            <FiPause className="mr-2" />
            Arrêter le serveur
          </button>
        ) : server.status === 'offline' ? (
          <button
            onClick={handleStart}
            className="btn-primary px-4 py-2"
          >
            <FiPlay className="mr-2" />
            Démarrer le serveur
          </button>
        ) : (
          <>
            <button
              onClick={handleStart}
              className="btn-secondary px-4 py-2"
            >
              <FiPlay className="mr-2" />
              Démarrer
            </button>
            <button
              onClick={handleStop}
              className="btn-secondary px-4 py-2 ml-2"
            >
              <FiPause className="mr-2" />
              Arrêter
            </button>
          </>
        )}
        <Link
          to="/servers"
          className="btn-link ml-auto hover:text-primary-dark dark:hover:text-primary"
        >
          Retour à la liste
        </Link>
      </div>
    </div>
  );
};

export default ServerView;