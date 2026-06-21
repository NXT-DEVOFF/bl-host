const serverService = require('../services/serverService');
const { handleAsyncError } = require('../utils/errorHandler');

const createServer = handleAsyncError(async (req, res) => {
  const { userId } = req;
  const result = await serverService.createServer(userId, req.body);
  
  res.status(201).json({
    success: true,
    data: result,
  });
});

const getServers = handleAsyncError(async (req, res) => {
  const { userId } = req;
  const servers = await serverService.getServers(userId);
  
  res.json({
    success: true,
    data: { servers },
  });
});

const getServerById = handleAsyncError(async (req, res) => {
  const { userId } = req;
  const { id } = req.params;
  const server = await serverService.getServerById(id, userId);
  
  res.json({
    success: true,
    data: server,
  });
});

const updateServer = handleAsyncError(async (req, res) => {
  const { userId } = req;
  const { id } = req.params;
  const server = await serverService.updateServer(id, userId, req.body);
  
  res.json({
    success: true,
    data: server,
  });
});

const deleteServer = handleAsyncError(async (req, res) => {
  const { userId } = req;
  const { id } = req.params;
  const result = await serverService.deleteServer(id, userId);
  
  res.json({
    success: true,
    data: result,
  });
});

const toggleServerStatus = handleAsyncError(async (req, res) => {
  const { userId } = req;
  const { id } = req.params;
  const { action } = req.body;
  const server = await serverService.toggleServerStatus(id, userId, action);
  
  res.json({
    success: true,
    data: server,
  });
});

module.exports = {
  createServer,
  getServers,
  getServerById,
  updateServer,
  deleteServer,
  toggleServerStatus,
};
