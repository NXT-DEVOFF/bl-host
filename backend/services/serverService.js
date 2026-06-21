const db = require('../models');
const { AppError } = require('../utils/errorHandler');
const { validateServerName, validatePort, validateIP } = require('../utils/validators');

class ServerService {
  async createServer(userId, data) {
    const { name, game, ip_address, port } = data;

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
      userId,
      status: 'offline',
    });

    return server;
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
    await server.destroy();
    return { message: 'Server deleted successfully' };
  }

  async toggleServerStatus(serverId, userId, action) {
    const server = await this.getServerById(serverId, userId);
    const validActions = ['start', 'stop', 'restart'];

    if (!validActions.includes(action)) {
      throw new AppError('Invalid action', 400, 'INVALID_ACTION');
    }

    // Simulate server action (in production, connect to actual game server)
    const statusMap = {
      start: 'online',
      stop: 'offline',
      restart: 'online',
    };

    await server.update({ status: statusMap[action] });
    return server;
  }
}

module.exports = new ServerService();
