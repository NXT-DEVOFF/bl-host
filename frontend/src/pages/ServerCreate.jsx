import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import serverService from '../services/serverService';

const ServerCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

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

  // Pré-remplissage en mode édition
  useEffect(() => {
    if (!isEdit) return;
    const fetchServer = async () => {
      try {
        const res = await serverService.getServerById(id);
        const s = res.data;
        setFormData({
          name: s.name || '',
          game: s.game || '',
          description: s.description || '',
          memory: s.memory || 1024,
          disk: s.disk || 5000,
          cpu: s.cpu || 100,
          ports: s.ports || '',
        });
      } catch (err) {
        console.error('Failed to load server:', err);
        setError('Impossible de charger le serveur à modifier.');
      }
    };
    fetchServer();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = {
      name: formData.name,
      game: formData.game,
      description: formData.description,
      memory: formData.memory,
      disk: formData.disk,
      cpu: formData.cpu,
      ports: formData.ports,
    };

    try {
      let res;
      if (isEdit) {
        res = await serverService.updateServer(id, payload);
        setSuccess('Serveur mis à jour avec succès !');
      } else {
        res = await serverService.createServer(payload);
        setSuccess('Serveur créé avec succès !');
      }
      const newId = res.data.id;
      setTimeout(() => {
        navigate(`/servers/${newId}`);
      }, 1000);
    } catch (err) {
      console.error('Failed to save server:', err);
      setError(err.error?.message || 'Impossible d\'enregistrer le serveur. Veuillez vérifier les informations et réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isEdit ? 'Modifier le serveur' : 'Créer un nouveau serveur'}
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
        <div className="bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-400 p-4 rounded-md mb-6">
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
              placeholder="Mon serveur Minecraft"
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
              {formData.game && !games.some((g) => g.value === formData.game) && (
                <option value={formData.game}>{formData.game}</option>
              )}
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
              {loading
                ? (isEdit ? 'Mise à jour...' : 'Création...')
                : (isEdit ? 'Mettre à jour' : 'Créer le serveur')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ServerCreate;
