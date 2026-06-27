const db = require('../models');
const { AppError } = require('../utils/errorHandler');
const { validateServerName, validatePort, validateIP } = require('../utils/validators');
const logger = require('../config/logger');
const dockerService = require('./dockerService');
const { resolveGameImage } = require('../config/games');

class ServerService {
  constructor() {
    // Transitions en cours par serveur : id -> 'starting' | 'stopping'.
    // Permet d'afficher des états transitoires pendant les opérations Docker.
    this._transitions = new Map();
  }

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
      // On marque un état transitoire et on lance l'opération en arrière-plan :
      // le statut réel sera reflété par le polling de getServerStatus().
      const transitional = action === 'stop' ? 'stopping' : 'starting';
      this._transitions.set(server.id, transitional);
      await server.update({ status: transitional });
      this._runDockerAction(server, action);
      return server;
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

  /** Exécute l'action Docker en arrière-plan (non bloquant). */
  async _runDockerAction(server, action) {
    try {
      if (action === 'start') await dockerService.start(server.container_id);
      else if (action === 'restart') await dockerService.restart(server.container_id);
      else if (action === 'stop') await dockerService.stop(server.container_id);
    } catch (err) {
      logger.error('Action Docker échouée.', { serverId: server.id, action, error: err.message });
      this._transitions.delete(server.id);
      try {
        await server.update({ status: 'offline' });
      } catch (e) {
        /* ignore */
      }
    }
  }

  /** Renvoie l'état réel du serveur (depuis Docker + transitions en cours). */
  async getServerStatus(serverId, userId) {
    const server = await this.getServerById(serverId, userId);

    if (dockerService.isEnabled() && server.container_id) {
      try {
        const raw = await dockerService.status(server.container_id); // online | offline | starting
        const transition = this._transitions.get(server.id);
        let status = raw;

        if (transition === 'stopping') {
          if (raw === 'offline') {
            this._transitions.delete(server.id);
            status = 'offline';
          } else {
            status = 'stopping';
          }
        } else if (transition === 'starting') {
          if (raw === 'online') {
            const gameConfig = resolveGameImage(server.game);
            const ready = await dockerService.isReady(
              server.container_id,
              gameConfig && gameConfig.readyPattern
            );
            if (ready) {
              this._transitions.delete(server.id);
              status = 'online';
            } else {
              status = 'starting';
            }
          } else {
            status = 'starting';
          }
        }

        if (status !== server.status) await server.update({ status });
        return { status, live: true };
      } catch (err) {
        logger.error('Lecture du statut Docker échouée.', { serverId, error: err.message });
      }
    }

    return { status: server.status, live: false };
  }

  /** Métriques temps réel (CPU %, RAM) du serveur. */
  async getServerStats(serverId, userId) {
    const server = await this.getServerById(serverId, userId);
    const fallback = {
      live: false,
      running: server.status === 'online',
      cpuPercent: 0,
      memUsedMB: 0,
      memLimitMB: server.memory || 0,
      memPercent: 0,
    };

    if (dockerService.isEnabled() && server.container_id) {
      try {
        const status = await dockerService.status(server.container_id);
        if (status !== 'online') {
          return { ...fallback, live: true, running: false };
        }
        const stats = await dockerService.stats(server.container_id);
        return { live: true, running: true, ...stats };
      } catch (err) {
        logger.error('Lecture des stats Docker échouée.', { serverId, error: err.message });
      }
    }

    return fallback;
  }

  /** Envoie une commande à la console du serveur de jeu. */
  async sendCommand(serverId, userId, command) {
    const server = await this.getServerById(serverId, userId);

    if (!command || !String(command).trim()) {
      throw new AppError('Commande vide', 400, 'EMPTY_COMMAND');
    }

    if (dockerService.isEnabled() && server.container_id) {
      if (server.status !== 'online') {
        throw new AppError('Le serveur doit être en ligne', 409, 'SERVER_NOT_ONLINE');
      }
      try {
        await dockerService.sendCommand(server.container_id, command);
        return { sent: true, live: true };
      } catch (err) {
        logger.error('Envoi de commande échoué.', { serverId, error: err.message });
        throw new AppError("Impossible d'envoyer la commande", 502, 'DOCKER_ERROR');
      }
    }

    return {
      sent: false,
      live: false,
      message: 'Console interactive indisponible en mode démo.',
    };
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
