import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiTrash2, FiEdit2, FiPlay, FiPause, FiStopCircle, FiRefreshCw, FiTerminal, FiLoader } from 'react-icons/fi';
import serverService from '../services/serverService';

const ServerView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [logs, setLogs] = useState('');
  const [logsLive, setLogsLive] = useState(false);

  useEffect(() => {
    const fetchServer = async () => {
      try {
        const res = await serverService.getServerById(id);
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

  const refreshLogs = async () => {
    try {
      const res = await serverService.getServerLogs(id);
      setLogs(res.data.logs || '');
      setLogsLive(Boolean(res.data.live));
    } catch (err) {
      // Silencieux : la console conserve son dernier état connu.
    }
  };

  const refreshStatus = async () => {
    try {
      const res = await serverService.getServerStatus(id);
      setServer((prev) => (prev ? { ...prev, status: res.data.status } : prev));
    } catch (err) {
      // Silencieux.
    }
  };

  // Rafraîchit automatiquement le statut et la console toutes les 5 secondes.
  useEffect(() => {
    if (!server) return undefined;
    refreshLogs();
    const interval = setInterval(() => {
      refreshStatus();
      refreshLogs();
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server?.id]);

  const handleAction = async (action) => {
    setActionLoading(action);
    setError('');
    try {
      const res = await serverService.toggleServerStatus(id, action);
      setServer((prev) => ({ ...prev, status: res.data.status }));
      // Laisse le conteneur démarrer, puis rafraîchit statut + console.
      setTimeout(() => { refreshStatus(); refreshLogs(); }, 1500);
    } catch (err) {
      console.error('Failed to update server:', err);
      setError(err.error?.message || "Impossible de modifier l'état du serveur.");
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce serveur ? Cette action est irréversible.')) {
      return;
    }
    try {
      await serverService.deleteServer(id);
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
            className="btn-secondary mt-4"
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
            className="btn-secondary mt-4"
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
            className="btn-link inline-flex items-center hover:text-primary-dark dark:hover:text-primary"
          >
            <FiEdit2 className="h-4 w-4" />
          </Link>
          <button
            onClick={handleDelete}
            className="btn-link inline-flex items-center hover:text-red-500 dark:hover:text-red-400"
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Jeu</p>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {server.game}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut</p>
              <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                server.status === 'online'
                  ? 'bg-green-100 text-green-800'
                  : server.status === 'offline'
                  ? 'bg-red-100 text-red-800'
                  : server.status === 'starting'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {server.status === 'online' ? (
                  <><FiPlay className="mr-1 h-4 w-4" /> En ligne</>
                ) : server.status === 'offline' ? (
                  <><FiStopCircle className="mr-1 h-4 w-4" /> Hors ligne</>
                ) : server.status === 'starting' ? (
                  <><FiPlay className="mr-1 h-4 w-4 animate-spin" /> Démarrage...</>
                ) : (
                  <><FiPause className="mr-1 h-4 w-4" /> Arrêt...</>
                )}
              </span>
            </div>
          </div>

          <div className="border-t border-border dark:border-border-dark pt-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</p>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {server.description || 'Aucune description'}
            </p>
          </div>

          <div className="border-t border-border dark:border-border-dark pt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mémoire RAM</p>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {server.memory || 'N/A'} MB
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Espace disque</p>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {server.disk || 'N/A'} MB
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">CPU</p>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {server.cpu || 'N/A'}%
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border dark:border-border-dark pt-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Ports</p>
            <p className="text-gray-700 dark:text-gray-300">
              {server.ports || `${server.ip_address || ''}${server.port ? ':' + server.port : ''}` || 'Ports par défaut du jeu'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {server.status === 'online' ? (
          <button
            onClick={() => handleAction('stop')}
            disabled={Boolean(actionLoading)}
            className="btn-danger inline-flex items-center px-4 py-2 disabled:opacity-60"
          >
            {actionLoading === 'stop' ? <FiLoader className="mr-2 animate-spin" /> : <FiPause className="mr-2" />}
            Arrêter
          </button>
        ) : (
          <button
            onClick={() => handleAction('start')}
            disabled={Boolean(actionLoading)}
            className="btn-primary inline-flex items-center px-4 py-2 disabled:opacity-60"
          >
            {actionLoading === 'start' ? <FiLoader className="mr-2 animate-spin" /> : <FiPlay className="mr-2" />}
            Démarrer
          </button>
        )}
        <button
          onClick={() => handleAction('restart')}
          disabled={Boolean(actionLoading)}
          className="btn-secondary inline-flex items-center px-4 py-2 disabled:opacity-60"
        >
          {actionLoading === 'restart' ? <FiLoader className="mr-2 animate-spin" /> : <FiRefreshCw className="mr-2" />}
          Redémarrer
        </button>
        <Link
          to="/servers"
          className="btn-link ml-auto hover:text-primary-dark dark:hover:text-primary"
        >
          Retour à la liste
        </Link>
      </div>

      {/* Console en direct du serveur de jeu */}
      <div className="card-pro mt-6">
        <div className="card-pro-header">
          <h3 className="card-pro-title inline-flex items-center gap-2">
            <FiTerminal className="h-4 w-4" /> Console
          </h3>
          <span className={`badge ${logsLive ? 'badge-success' : 'badge-secondary'}`}>
            {logsLive ? 'En direct' : 'Mode démo'}
          </span>
        </div>
        <div className="card-pro-content">
          <pre className="bg-gray-900 text-green-300 text-xs rounded-lg p-4 h-72 overflow-auto whitespace-pre-wrap font-mono">
            {logs || 'Chargement de la console...'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ServerView;
