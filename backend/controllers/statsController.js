const db = require('../models');
const { handleAsyncError } = require('../utils/errorHandler');

const getStats = handleAsyncError(async (req, res) => {
  const { userId } = req;

  const servers = await db.Server.findAll({ where: { userId } });
  const totalServers = servers.length;
  const onlineServers = servers.filter(server => server.status === 'online').length;
  const offlineServers = servers.filter(server => server.status === 'offline').length;

  const stats = {
    servers: {
      total: totalServers,
      online: onlineServers,
      offline: offlineServers,
    },
    games: [...new Set(servers.map(s => s.game))].length,
    lastUpdated: new Date().toISOString(),
  };

  res.json({
    success: true,
    data: stats,
  });
});

module.exports = {
  getStats,
};
