const db = require('../models');
const { AppError } = require('../utils/errorHandler');
const { validateServerName, validatePort, validateIP } = require('../utils/validators');
const logger = require('../config/logger');
const dockerService = require('./dockerService');
const { resolveGameImage } = require('../config/games');

class ServerService {
  async createServer(userId, data) {
    const { name, game, ip_address, port, description, memory, disk, cpu, ports } = data;

    // Validation
    if (!name || !game) {
      throw new AppError('Server name and game are required', 400, 'VALIDATION_ERROR');
    }

    if (!validateServerName(name)) {
      throw new AppError('Server name must be 3-100 characters', 400, 'INVALID_NAME');
    }

    if (ip_address && !validateIP(ip_address)) {
      throw new AppError('Invalid IP address', 400, 'INVALID_IP');
    }

    if (port && !validatePort(port)) {
      throw new AppError('Invalid port number (1-65535)', 400, 'INVALID_PORT');
    }

    const server = await db.Server.create({
      name,
      game,
      ip_address: ip_address || null,
      port: port || null,
      description: description || null,
      memory: memory || undefined,
      disk: disk || undefined,
      cpu: cpu || undefined,
      ports: ports || null,
      userId,
      status: 'offline',
    });

    // Provisionne un vrai conteneur Docker si l'hôte est configuré et le jeu pris
    // en charge ; sinon le serveur reste en mode démo (container_id null).
    await this._provisionContainer(server);

    return server;
  }

  /** Crée le conteneur Docker associé au serveur (best-effort, non bloquant). */
  async _provisionContainer(server) {
    const gameConfig = resolveGameImage(server.game);
    if (!dockerService.isEnabled() || !gameConfig) return;

    try {
      const hostPort = server.port || (30000 + (server.id % 20000));
      const { containerId } = await dockerService.createGameContainer({
        serverId: server.id,
        gameConfig,
        memory: server.memory || 1024,
        cpu: server.cpu || 100,
        hostPort,
      });
      await server.update({ container_id: containerId, port: hostPort });
      logger.info('Conteneur Docker créé pour le serveur.', { serverId: server.id, containerId });
    } catch (err) {
      logger.error('Échec de la création du conteneur (serveur conservé en mode démo).', {
        serverId: server.id,
        error: err.message,
      });
    }
  }

  async getServers(userId) {
    const servers = await db.Server.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    return servers;
  }

  async getServerById(serverId, userId) {
    const server = await db.Server.findOne({
      where: { id: serverId, userId },
    });

    if (!server) {
      throw new AppError('Server not found', 404, 'SERVER_NOT_FOUND');
    }

    return server;
  }

  async updateServer(serverId, userId, data) {
    const server = await this.getServerById(serverId, userId);

    // Validation
    if (data.name && !validateServerName(data.name)) {
      throw new AppError('Server name must be 3-100 characters', 400, 'INVALID_NAME');
    }

    if (data.ip_address && !validateIP(data.ip_address)) {
      throw new AppError('Invalid IP address', 400, 'INVALID_IP');
    }

    if (data.port && !validatePort(data.port)) {
      throw new AppError('Invalid port number (1-65535)', 400, 'INVALID_PORT');
    }

    await server.update(data);
    return server;
  }

  async deleteServer(serverId, userId) {
    const server = await this.getServerById(serverId, userId);

    // Supprime aussi le conteneur Docker et son volume si présents.
    if (dockerService.isEnabled() && server.container_id) {
      try {
        await dockerService.remove(server.container_id);
      } catch (err) {
        logger.error('Suppression du conteneur Docker échouée.', { serverId, error: err.message });
      }
    }

    await server.destroy();
    return { message: 'Server deleted successfully' };
  }

  async toggleServerStatus(serverId, userId, action) {
    const server = await this.getServerById(serverId, userId);
    const validActions = ['start', 'stop', 'restart'];

    if (!validActions.includes(action)) {
      throw new AppError('Invalid action', 400, 'INVALID_ACTION');
    }

    // --- Gestion RÉELLE via Docker si un conteneur est associé ---
    if (dockerService.isEnabled() && server.container_id) {
      try {
        if (action === 'start') await dockerService.start(server.container_id);
        else if (action === 'stop') await dockerService.stop(server.container_id);
        else if (action === 'restart') await dockerService.restart(server.container_id);

        const status = await dockerService.status(server.container_id);
        await server.update({ status });
        return server;
      } catch (err) {
        logger.error('Action Docker échouée.', { serverId, action, error: err.message });
        throw new AppError("Impossible d'exécuter l'action sur le conteneur", 502, 'DOCKER_ERROR');
      }
    }

    // --- Repli : simulation (mode démo) ---
    const statusMap = {
      start: 'online',
      stop: 'offline',
      restart: 'online',
    };

    await server.update({ status: statusMap[action] });
    return server;
  }

  /** Renvoie l'état réel du serveur (depuis Docker si disponible). */
  async getServerStatus(serverId, userId) {
    const server = await this.getServerById(serverId, userId);

    if (dockerService.isEnabled() && server.container_id) {
      try {
        const status = await dockerService.status(server.container_id);
        if (status !== server.status) await server.update({ status });
        return { status, live: true };
      } catch (err) {
        logger.error('Lecture du statut Docker échouée.', { serverId, error: err.message });
      }
    }

    return { status: server.status, live: false };
  }

  /** Renvoie les derniers logs (console) du serveur de jeu. */
  async getServerLogs(serverId, userId, tail = 200) {
    const server = await this.getServerById(serverId, userId);

    if (dockerService.isEnabled() && server.container_id) {
      try {
        const logs = await dockerService.logs(server.container_id, tail);
        return { logs, live: true };
      } catch (err) {
        logger.error('Lecture des logs Docker échouée.', { serverId, error: err.message });
        return { logs: '', live: true, error: 'Logs indisponibles pour le moment.' };
      }
    }

    return {
      logs:
        'Console indisponible en mode démo.\n' +
        "Configurez un hôte Docker (DOCKER_HOST) pour activer les vrais serveurs et leur console.",
      live: false,
    };
  }
}

module.exports = new ServerService();
