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
    // Flux stdin persistants par conteneur (console interactive).
    this._stdin = new Map();
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
      // stdin ouvert : permet d'envoyer des commandes à la console du jeu.
      OpenStdin: true,
      StdinOnce: false,
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

  /**
   * Indique si le serveur est « prêt » en cherchant un motif dans les logs.
   * Si aucun motif n'est fourni, on considère le serveur prêt dès qu'il tourne.
   */
  async isReady(containerId, pattern, tail = 80) {
    if (!pattern) return true;
    try {
      const text = await this.logs(containerId, tail);
      return new RegExp(pattern, 'i').test(text);
    } catch (err) {
      return false;
    }
  }

  /** Statistiques temps réel : CPU %, RAM utilisée/limite (en Mo). */
  async stats(containerId) {
    const container = this.docker.getContainer(containerId);
    const s = await container.stats({ stream: false });

    // Calcul du % CPU à la manière de `docker stats`.
    const cpuDelta =
      (s.cpu_stats?.cpu_usage?.total_usage || 0) -
      (s.precpu_stats?.cpu_usage?.total_usage || 0);
    const systemDelta =
      (s.cpu_stats?.system_cpu_usage || 0) -
      (s.precpu_stats?.system_cpu_usage || 0);
    const cpuCount =
      s.cpu_stats?.online_cpus ||
      (s.cpu_stats?.cpu_usage?.percpu_usage?.length) ||
      1;
    let cpuPercent = 0;
    if (systemDelta > 0 && cpuDelta > 0) {
      cpuPercent = (cpuDelta / systemDelta) * cpuCount * 100;
    }

    const memUsed =
      (s.memory_stats?.usage || 0) - (s.memory_stats?.stats?.cache || 0);
    const memLimit = s.memory_stats?.limit || 0;

    return {
      cpuPercent: Math.round(cpuPercent * 10) / 10,
      memUsedMB: Math.round(memUsed / 1048576),
      memLimitMB: Math.round(memLimit / 1048576),
      memPercent: memLimit ? Math.round((memUsed / memLimit) * 1000) / 10 : 0,
    };
  }

  /**
   * Envoie une commande à la console du serveur de jeu (via stdin du conteneur).
   * Réutilise un flux stdin persistant par conteneur.
   */
  async sendCommand(containerId, command) {
    const clean = String(command).replace(/[\r\n]+/g, '');
    if (!clean) return false;

    let stream = this._stdin.get(containerId);
    if (!stream || stream.destroyed || stream.writable === false) {
      const container = this.docker.getContainer(containerId);
      stream = await container.attach({
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true,
        hijack: true,
      });
      // On ne consomme pas la sortie ici (elle est lue via `logs`), mais on
      // draine le flux pour éviter toute contre-pression.
      stream.on('data', () => {});
      stream.on('close', () => this._stdin.delete(containerId));
      stream.on('error', () => this._stdin.delete(containerId));
      this._stdin.set(containerId, stream);
    }

    stream.write(clean + '\n');
    return true;
  }
}

module.exports = new DockerService();
