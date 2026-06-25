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
      setError(err.error?.message || 'Impossible de charger le tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue sur votre panel de serveurs de jeu</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => navigate('/servers')}>
            Mes serveurs
          </Button>
          <Button variant="secondary" onClick={() => navigate('/profile')}>
            Profil
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>
      </div>

      {error && <Error message={error} />}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.servers.total}</div>
              <div className="text-gray-600 text-sm">Serveurs totaux</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.servers.online}</div>
              <div className="text-gray-600 text-sm">En ligne</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.servers.offline}</div>
              <div className="text-gray-600 text-sm">Hors ligne</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.games}</div>
              <div className="text-gray-600 text-sm">Jeux</div>
            </div>
          </Card>
        </div>
      )}

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Vos serveurs</h2>
          <Button variant="primary" onClick={() => navigate('/servers/create')}>
            + Créer un serveur
          </Button>
        </div>

        {servers.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            Aucun serveur pour le moment. Créez votre premier serveur !
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Nom</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Jeu</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Statut</th>
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
                      {server.ip_address || 'N/A'}:{server.port || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/servers/${server.id}`)}
                      >
                        Voir
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
