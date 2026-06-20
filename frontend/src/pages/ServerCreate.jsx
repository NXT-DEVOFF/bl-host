import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ServerCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    description: '',
    memory: 1024,
    disk: 5000,
    cpu: 100,
    ports: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const games = [
    { value: 'minecraft', label: 'Minecraft' },
    { value: 'rust', label: 'Rust' },
    { value: 'valheim', label: 'Valheim' },
    { value: 'fortnite', label: 'Fortnite' },
    { value: 'csgo', label: 'Counter-Strike: Global Offensive' },
    { value: 'gmod', label: 'Garry\'s Mod' },
    { value: 'terraria', label: 'Terraria' },
    { value: 'ark', label: 'ARK: Survival Evolved' },
    { value: 'other', label: 'Autre' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let res;
      if (location.state && location.state.server) {
        // Edit mode
        res = await axios.put(
          `/api/servers/${location.state.server.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        setSuccess('Serveur mis à jour avec succès !');
      } else {
        // Create mode
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id || 1;
        res = await axios.post(
          '/api/servers',
          {
            ...formData,
            userId,
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        setSuccess('Serveur créé avec succès !');
      }
      setTimeout(() => {
        navigate(`/servers/${res.data.id}`);
      }, 1500);
    } catch (err) {
      console.error('Failed to save server:', err);
      setError('Impossible d\'enregistrer le serveur. Veuillez vérifier les informations et réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Prefill form if editing
  React.useEffect(() => {
    if (location.state && location.state.server) {
      setFormData(location.state.server);
    }
  }, [location.state]);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {location.state && location.state.server ? 'Modifier le serveur' : 'Créer un nouveau serveur'}
        </h1>
        <Link to="/servers" className="btn-link hover:text-primary-dark dark:hover:text-primary">
          Retour à la liste
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 dark:bg-red-900 dark:text-red-400 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-500 dark:bg-green-900 dark:text-green-400 p-4 rounded-md mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom du serveur
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-pro"
              placeholder="Mon serveur MineCraft"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Jeu
            </label>
            <select
              required
              value={formData.game}
              onChange={(e) => setFormData({ ...formData, game: e.target.value })}
              className="input-pro"
            >
              <option value="">Sélectionnez un jeu</option>
              {games.map((game) => (
                <option key={game.value} value={game.value}>
                  {game.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description (optionnelle)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input-pro"
            rows="4"
            placeholder="Description de votre serveur..."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mémoire RAM (MB)
            </label>
            <input
              type="number"
              min="512"
              value={formData.memory}
              onChange={(e) => setFormData({ ...formData, memory: parseInt(e.target.value) || 1024 })}
              className="input-pro"
              placeholder="1024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Espace disque (MB)
            </label>
            <input
              type="number"
              min="1000"
              value={formData.disk}
              onChange={(e) => setFormData({ ...formData, disk: parseInt(e.target.value) || 5000 })}
              className="input-pro"
              placeholder="5000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CPU (%)
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={formData.cpu}
              onChange={(e) => setFormData({ ...formData, cpu: parseInt(e.target.value) || 100 })}
              className="input-pro"
              placeholder="100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ports (séparés par des virgules)
          </label>
          <input
            type="text"
            value={formData.ports}
            onChange={(e) => setFormData({ ...formData, ports: e.target.value })}
            className="input-pro"
            placeholder="25565, 25575 (ex: pour Minecraft)"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Laissez vide pour utiliser les ports par défaut du jeu sélectionné
          </p>
        </div>

        <div className="pt-4 border-t border-border dark:border-border-dark">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/servers')}
              className="btn-link hover:text-primary-dark dark:hover:text-primary"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-[200px]"
            >
              {loading ? (
                <>
                  <span className="loading-spinner mr-2"></span>
                  {location.state && location.state.server ? 'Mise à jour...' : 'Création...'}
                </>
              ) : (
                location.state && location.state.server ? 'Mettre à jour' : 'Créer le serveur'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ServerCreate;