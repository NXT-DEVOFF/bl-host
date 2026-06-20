const express = require('express');
const router = express.Router();
const db = require('../models');

// Get stats for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.userId;
    const servers = await db.Server.findAll({ where: { userId } });
    const totalServers = servers.length;
    const onlineServers = servers.filter(server => server.status === 'online').length;
    // We don't have a user count in this example, but we can assume 1 for now or get from User table
    const userCount = 1; // Placeholder
    const uptime = '24h'; // Placeholder

    res.json({ servers: totalServers, online: onlineServers, users: userCount, uptime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;