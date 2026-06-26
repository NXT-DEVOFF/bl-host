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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gradient inline-block">Tableau de bord</h1>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Serveurs totaux',
              value: stats.servers.total,
              accent: 'from-indigo-500 to-blue-500',
              text: 'text-indigo-600',
              icon: (
                <path d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              ),
            },
            {
              label: 'En ligne',
              value: stats.servers.online,
              accent: 'from-emerald-500 to-green-500',
              text: 'text-emerald-600',
              icon: <path d="M5 13l4 4L19 7" />,
            },
            {
              label: 'Hors ligne',
              value: stats.servers.offline,
              accent: 'from-red-500 to-rose-500',
              text: 'text-red-600',
              icon: <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />,
            },
            {
              label: 'Jeux',
              value: stats.games,
              accent: 'from-violet-500 to-purple-500',
              text: 'text-violet-600',
              icon: <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
            },
          ].map((stat, i) => (
            <Card
              key={stat.label}
              hover
              className={`relative overflow-hidden animate-fade-in-up stagger-${i + 1}`}
            >
              <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${stat.accent}`} />
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-3xl font-bold ${stat.text}`}>{stat.value}</div>
                  <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
                </div>
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${stat.accent} flex items-center justify-center text-white shadow-md`}>
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {stat.icon}
                  </svg>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="animate-fade-in-up stagger-5">
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
                {servers.map((server, idx) => (
                  <tr
                    key={server.id}
                    className="border-t hover:bg-indigo-50/60 transition-colors animate-fade-in"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
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
