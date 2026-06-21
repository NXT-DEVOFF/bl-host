import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Loading, Error } from '../components/UI';
import serverService from '../services/serverService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, serversRes] = await Promise.all([
        serverService.getStats(),
        serverService.getServers(),
      ]);
      setStats(statsRes.data);
      setServers(serversRes.data.servers || []);
    } catch (err) {
      setError(err.error?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to your game server panel</p>
      </div>

      {error && <Error message={error} />}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.servers.total}</div>
              <div className="text-gray-600 text-sm">Total Servers</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.servers.online}</div>
              <div className="text-gray-600 text-sm">Online</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.servers.offline}</div>
              <div className="text-gray-600 text-sm">Offline</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.games}</div>
              <div className="text-gray-600 text-sm">Games</div>
            </div>
          </Card>
        </div>
      )}

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Servers</h2>
          <Button variant="primary" onClick={() => navigate('/servers/create')}>
            + Create Server
          </Button>
        </div>

        {servers.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No servers yet. Create your first server!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Game</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">IP:Port</th>
                  <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {servers.map((server) => (
                  <tr key={server.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{server.name}</td>
                    <td className="px-4 py-3">{server.game}</td>
                    <td className="px-4 py-3">
                      <Badge variant={server.status === 'online' ? 'green' : 'red'}>
                        {server.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {server.ip_address}:{server.port || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/servers/${server.id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stats
        const statsRes = await axios.get('/api/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setStats(statsRes.data);

        // Fetch recent activity (placeholder for now)
        setRecentActivity([
          { id: 1, type: 'server', message: 'Serveur minecraft-01 démarré', time: 'Il y a 2 min' },
          { id: 2, type: 'user', message: 'Nouvel utilisateur inscrit: john_doe', time: 'Il y a 15 min' },
          { id: 3, type: 'server', message: 'Serveur rust-01 arrêté (maintenance)', time: 'Il y a 1 h' },
        ]);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="loading-spinner mx-auto h-10 w-10 text-primary"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Tableau de bord
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/servers/create')}
            className="btn-secondary px-4 py-2"
          >
            Créer un serveur
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="btn-link hover:text-primary-dark dark:hover:text-primary"
          >
            Profil
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-pro">
          <div className="flex items-center p-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 flex items-center justify-center bg-primary-dark/10 text-primary-dark rounded-lg">
                <FiServer className="h-5 w-5" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Serveurs totaux
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.servers}
              </p>
            </div>
          </div>
        </div>

        <div className="card-pro">
          <div className="flex items-center p-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 flex items-center justify-center bg-success/10 text-success rounded-lg">
                <FiWifi className="h-5 w-5" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                En ligne
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.online}
              </p>
            </div>
          </div>
        </div>

        <div className="card-pro">
          <div className="flex items-center p-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 flex items-center justify-center bg-info/10 text-info rounded-lg">
                <FiUsers className="h-5 w-5" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Utilisateurs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.users}
              </p>
            </div>
          </div>
        </div>

        <div className="card-pro">
          <div className="flex items-center p-4">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 flex items-center justify-center bg-warning/10 text-warning rounded-lg">
                <FiActivity className="h-5 w-5" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Temps de fonctionnement
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.uptime}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6">
        <div className="card-pro">
          <div className="card-pro-header">
            <h3 className="card-pro-title">Activité récente</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Dernières 24h
            </span>
          </div>
          <div className="card-pro-content space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium">
                    {activity.type === 'server' ? (
                      <FiServer className="h-4 w-4 text-primary" />
                    ) : (
                      <FiUsers className="h-4 w-4 text-secondary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                Aucune activité récente
              </p>
            )}
          </div>
        </div>

        <div className="card-pro">
          <div className="card-pro-header">
            <h3 className="card-pro-title">État du système</h3>
          </div>
          <div className="card-pro-content space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Utilisation CPU
              </span>
              <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                23%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full w-[23%]" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Utilisation mémoire
              </span>
              <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                45%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full w-[45%]" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Espace disque
              </span>
              <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                62%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full w-[62%]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;