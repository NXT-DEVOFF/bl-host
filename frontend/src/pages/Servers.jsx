import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiEdit2, FiPlay, FiPause, FiStopCircle, FiPlus } from 'react-icons/fi';

const Servers = () => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/servers', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setServers(res.data);
      } catch (err) {
        console.error('Failed to fetch servers:', err);
        setError('Impossible de charger la liste des serveurs. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, []);

  const handleDelete = async (serverId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce serveur ? Cette action est irréversible.')) {
      return;
    }

    try {
      await axios.delete(`/api/servers/${serverId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setServers(servers.filter(server => server.id !== serverId));
    } catch (err) {
      console.error('Failed to delete server:', err);
      setError('Impossible de supprimer le serveur. Veuillez réessayer.');
    }
  };

  const handleStartServer = async (serverId) => {
    try {
      await axios.post(
        `/api/servers/${serverId}/start`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      // Update server status optimistically
      setServers(
        servers.map((server) =>
          server.id === serverId ? { ...server, status: 'starting' } : server
        )
      );
    } catch (err) {
      console.error('Failed to start server:', err);
      setError('Impossible de démarrer le serveur. Veuillez réessayer.');
    }
  };

  const handleStopServer = async (serverId) => {
    try {
      await axios.post(
        `/api/servers/${serverId}/stop`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      // Update server status optimistically
      setServers(
        servers.map((server) =>
          server.id === serverId ? { ...server, status: 'stopping' } : server
        )
      );
    } catch (err) {
      console.error('Failed to stop server:', err);
      setError('Impossible d\'arrêter le serveur. Veuillez réessayer.');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="loading-spinner mx-auto h-10 w-10 text-primary"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Chargement des serveurs...</p>
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
          <p className="text-gray-500 dark:text-gray-400">Une erreur est survenue lors du chargement des serveurs.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary mt-4"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Mes serveurs
        </h1>
        <Link to="/servers/create" className="btn-primary px-4 py-2">
          <FiPlus className="mr-2" /> Créer un serveur
        </Link>
      </div>

      {servers.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex items-center justify-center mb-6">
            <div className="h-16 w-16 flex items-center justify-center bg-primary-dark/10 text-primary-dark rounded-full">
              <FiPlus className="h-8 w-8" />
            </div>
          </div>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-4">
            Aucun serveur pour le moment
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            Commencez par créer votre premier serveur de jeu
          </p>
          <Link to="/servers/create" className="btn-primary px-6 py-3">
            Créer mon premier serveur
          </Link>
        </div>
      ) : (
        <div>
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center w-full">
              <input
                type="text"
                placeholder="Rechercher un serveur..."
                className="input-pro w-full max-w-xs"
              />
            </div>
            <div className="flex items-center space-x-3">
              <select
                className="input-pro-sm w-full max-w-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="online">En ligne</option>
                <option value="offline">Hors ligne</option>
                <option value="starting">En cours de démarrage</option>
                <option value="stopping">En cours d'arrêt</option>
              </select>
            </div>
          </div>

          {/* Servers List */}
          <div className="space-y-4">
            {servers.map((server) => (
              <div
                key={server.id}
                className="card-pro hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-lg bg-primary-dark/10 text-primary-dark">
                      {server.game.toLowerCase().includes('minecraft') ? (
                        <div className="text-2xl">⛏️</div>
                      ) : server.game.toLowerCase().includes('rust') ? (
                        <div className="text-2xl">🦀</div>
                      ) : server.game.toLowerCase().includes('valheim') ? (
                        <div className="text-2xl">🛡️</div>
                      ) : server.game.toLowerCase().includes('fortnite') ? (
                        <div className="text-2xl">🕺</div>
                      ) : (
                        <div className="text-2xl">🎮</div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {server.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {server.game} • ID: {server.id}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 text-xs font-medium rounded-full">
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
                      <div className="flex items-center space-x-3">
                        <Link
                          to={`/servers/${server.id}`}
                          className="btn-link hover:text-primary-dark dark:hover:text-primary"
                        >
                          Voir
                        </Link>
                        <Link
                          to={`/servers/${server.id}/edit`}
                          className="btn-link hover:text-primary-dark dark:hover:text-primary ml-2"
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() =>
                            server.status === 'online' || server.status === 'starting'
                              ? handleStopServer(server.id)
                              : handleStartServer(server.id)
                          }
                          className="btn-link hover:text-primary-dark dark:hover:text-primary p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {server.status === 'online' || server.status === 'starting' ? (
                            <FiPause className="h-4 w-4" />
                          ) : (
                            <FiPlay className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(server.id)}
                          className="btn-link hover:text-red-500 dark:hover:red-400 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Servers;