// =============================================================================
// dockerService — « BL-Host Wings »
// -----------------------------------------------------------------------------
// Pilote un hôte Docker (une VM/LXC sur votre Proxmox) via l'API Docker Engine.
// C'est l'équivalent maison de Pterodactyl Wings : chaque serveur de jeu tourne
// dans son propre conteneur Docker, démarré/arrêté réellement par le panel.
//
// Le service est OPTIONNEL : s'il n'est pas configuré (ou si dockerode n'est pas
// installé / l'hôte injoignable), `isEnabled()` renvoie false et le reste de
// l'application retombe automatiquement sur le mode démo (simulation).
//
// Configuration (backend/.env) :
//   DOCKER_HOST=tcp://IP_DE_LA_VM:2376      # API Docker distante (TLS recommandé)
//   DOCKER_TLS_VERIFY=1                       # active TLS
//   DOCKER_CERT_PATH=/home/blhost/docker-certs# dossier contenant ca/cert/key.pem
//   # — ou, si le backend tourne SUR l'hôte Docker —
//   DOCKER_SOCKET=/var/run/docker.sock
// =============================================================================

const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

let Docker = null;
try {
  // Chargé paresseusement : si le paquet n'est pas installé, le service reste
  // simplement désactivé au lieu de faire planter le backend.
  Docker = require('dockerode');
} catch (err) {
  logger.warn("dockerode n'est pas installé : gestion Docker désactivée (mode démo).");
}

const CONTAINER_PREFIX = 'blhost-';

class DockerService {
  constructor() {
    this.docker = null;
    this.enabled = false;
    this._init();
  }

  _init() {
    if (!Docker) return;

    const options = this._buildOptions();
    if (!options) {
      logger.info('Docker non configuré (DOCKER_HOST/DOCKER_SOCKET absents) : mode démo.');
      return;
    }

    try {
      this.docker = new Docker(options);
      this.enabled = true;
      logger.info('Service Docker initialisé.', {
        target: options.socketPath || `${options.host}:${options.port}`,
      });
    } catch (err) {
      logger.error("Échec de l'initialisation Docker, mode démo conservé.", { error: err.message });
      this.enabled = false;
    }
  }

  _buildOptions() {
    const host = process.env.DOCKER_HOST;
    const socket = process.env.DOCKER_SOCKET;

    if (host && host.startsWith('tcp://')) {
      const url = new URL(host);
      const opts = {
        host: url.hostname,
        port: url.port ? Number(url.port) : 2375,
      };
      const certPath = process.env.DOCKER_CERT_PATH;
      if (process.env.DOCKER_TLS_VERIFY === '1' || certPath) {
        try {
          opts.ca = fs.readFileSync(path.join(certPath, 'ca.pem'));
          opts.cert = fs.readFileSync(path.join(certPath, 'cert.pem'));
          opts.key = fs.readFileSync(path.join(certPath, 'key.pem'));
          opts.protocol = 'https';
        } catch (err) {
          logger.error('Certificats TLS Docker introuvables.', { error: err.message, certPath });
          return null;
        }
      } else {
        opts.protocol = 'http';
      }
      return opts;
    }

    if (socket) {
      return { socketPath: socket };
    }

    return null;
  }

  isEnabled() {
    return this.enabled && this.docker !== null;
  }

  /** Teste la connexion à l'hôte Docker. */
  async ping() {
    if (!this.isEnabled()) return false;
    try {
      await this.docker.ping();
      return true;
    } catch (err) {
      logger.error('Ping Docker échoué.', { error: err.message });
      return false;
    }
  }

  containerName(serverId) {
    return `${CONTAINER_PREFIX}${serverId}`;
  }

  volumeName(serverId) {
    return `${CONTAINER_PREFIX}${serverId}-data`;
  }

  /** Télécharge l'image si elle n'est pas déjà présente localement. */
  async ensureImage(image) {
    const exists = await this.docker.listImages({ filters: { reference: [image] } });
    if (exists && exists.length > 0) return;

    logger.info('Téléchargement de l\'image Docker...', { image });
    await new Promise((resolve, reject) => {
      this.docker.pull(image, (err, stream) => {
        if (err) return reject(err);
        this.docker.modem.followProgress(stream, (doneErr) =>
          doneErr ? reject(doneErr) : resolve()
        );
      });
    });
    logger.info('Image téléchargée.', { image });
  }

  /**
   * Crée (sans démarrer) un conteneur de serveur de jeu.
   * @returns {Promise<{containerId: string, hostPort: number}>}
   */
  async createGameContainer({ serverId, gameConfig, memory = 1024, cpu = 100, hostPort }) {
    if (!this.isEnabled()) throw new Error('Docker non activé');

    await this.ensureImage(gameConfig.image);

    const portKey = `${gameConfig.containerPort}/${gameConfig.protocol}`;
    const env = {
      ...gameConfig.env,
      ...(gameConfig.memoryEnv ? gameConfig.memoryEnv(memory) : {}),
    };

    const container = await this.docker.createContainer({
      name: this.containerName(serverId),
      Image: gameConfig.image,
      Tty: true,
      Env: Object.entries(env).map(([k, v]) => `${k}=${v}`),
      ExposedPorts: { [portKey]: {} },
      HostConfig: {
        PortBindings: { [portKey]: [{ HostPort: String(hostPort) }] },
        Binds: [`${this.volumeName(serverId)}:${gameConfig.dataPath}`],
        Memory: Math.round(memory) * 1024 * 1024,
        NanoCpus: Math.round((cpu / 100) * 1e9),
        RestartPolicy: { Name: 'unless-stopped' },
      },
    });

    return { containerId: container.id, hostPort };
  }

  async _container(containerId) {
    return this.docker.getContainer(containerId);
  }

  async start(containerId) {
    await (await this._container(containerId)).start();
  }

  async stop(containerId) {
    try {
      await (await this._container(containerId)).stop({ t: 10 });
    } catch (err) {
      // 304 = déjà arrêté : on ignore.
      if (err.statusCode !== 304) throw err;
    }
  }

  async restart(containerId) {
    await (await this._container(containerId)).restart({ t: 10 });
  }

  async remove(containerId) {
    try {
      await (await this._container(containerId)).remove({ force: true, v: true });
    } catch (err) {
      if (err.statusCode !== 404) throw err;
    }
  }

  /** Renvoie l'état du conteneur, mappé sur notre enum (online/offline/starting). */
  async status(containerId) {
    try {
      const data = await (await this._container(containerId)).inspect();
      const state = data.State || {};
      if (state.Restarting) return 'starting';
      if (state.Running) return 'online';
      return 'offline';
    } catch (err) {
      if (err.statusCode === 404) return 'offline';
      throw err;
    }
  }

  /** Récupère les derniers logs du conteneur (console du serveur de jeu). */
  async logs(containerId, tail = 200) {
    const container = await this._container(containerId);
    const buffer = await container.logs({
      stdout: true,
      stderr: true,
      tail,
      timestamps: false,
    });
    return buffer.toString('utf8');
  }
}

module.exports = new DockerService();
