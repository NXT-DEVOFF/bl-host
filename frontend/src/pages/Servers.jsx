import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlay, FiPause, FiStopCircle, FiPlus } from 'react-icons/fi';
import serverService from '../services/serverService';

const Servers = () => {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      setLoading(true);
      const res = await serverService.getServers();
      setServers(res.data.servers || []);
    } catch (err) {
      console.error('Failed to fetch servers:', err);
      setError('Impossible de charger la liste des serveurs. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serverId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce serveur ? Cette action est irréversible.')) {
      return;
    }

    try {
      await serverService.deleteServer(serverId);
      setServers(servers.filter(server => server.id !== serverId));
    } catch (err) {
      console.error('Failed to delete server:', err);
      setError('Impossible de supprimer le serveur. Veuillez réessayer.');
    }
  };

  const handleAction = async (serverId, action) => {
    try {
      const res = await serverService.toggleServerStatus(serverId, action);
      const updated = res.data;
      setServers(servers.map((server) =>
        server.id === serverId ? { ...server, status: updated.status } : server
      ));
    } catch (err) {
      console.error('Failed to update server:', err);
      setError("Impossible de modifier l'état du serveur. Veuillez réessayer.");
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 animate-fade-in">
      <div className="mb-6 flex items-center justify-between animate-fade-in-down">
        <h1 className="text-2xl font-bold text-gradient inline-block">
          Mes serveurs
        </h1>
        <Link to="/servers/create" className="btn-primary inline-flex items-center px-4 py-2">
          <FiPlus className="mr-2" /> Créer un serveur
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 dark:bg-red-900 dark:text-red-400 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

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
          <Link to="/servers/create" className="btn-primary inline-block px-6 py-3">
            Créer mon premier serveur
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {servers.map((server) => {
            const isRunning = server.status === 'online' || server.status === 'starting';
            return (
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
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700">
                      {server.status === 'online' ? (
                        <><FiPlay className="mr-1 h-4 w-4 text-green-500" /> En ligne</>
                      ) : server.status === 'offline' ? (
                        <><FiStopCircle className="mr-1 h-4 w-4 text-red-500" /> Hors ligne</>
                      ) : server.status === 'starting' ? (
                        <><FiPlay className="mr-1 h-4 w-4 animate-spin" /> Démarrage...</>
                      ) : (
                        <><FiPause className="mr-1 h-4 w-4" /> Arrêt...</>
                      )}
                    </span>

                    <Link
                      to={`/servers/${server.id}`}
                      className="btn-link hover:text-primary-dark dark:hover:text-primary"
                    >
                      Voir
                    </Link>
                    <Link
                      to={`/servers/${server.id}/edit`}
                      className="btn-link hover:text-primary-dark dark:hover:text-primary"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleAction(server.id, isRunning ? 'stop' : 'start')}
                      className="btn-link hover:text-primary-dark dark:hover:text-primary p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      title={isRunning ? 'Arrêter' : 'Démarrer'}
                    >
                      {isRunning ? <FiPause className="h-4 w-4" /> : <FiPlay className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(server.id)}
                      className="btn-link hover:text-red-500 dark:hover:text-red-400 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Supprimer"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Servers;
