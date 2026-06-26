const express = require('express');
const router = express.Router();
const serverController = require('../controllers/serverController');

// Get all servers
router.get('/', serverController.getServers);

// Create server
router.post('/', serverController.createServer);

// Get specific server
router.get('/:id', serverController.getServerById);

// Get live status (from Docker if available)
router.get('/:id/status', serverController.getServerStatus);

// Get server console logs
router.get('/:id/logs', serverController.getServerLogs);

// Update server
router.put('/:id', serverController.updateServer);

// Delete server
router.delete('/:id', serverController.deleteServer);

// Toggle server status (start/stop/restart)
router.post('/:id/action', serverController.toggleServerStatus);

module.exports = router;