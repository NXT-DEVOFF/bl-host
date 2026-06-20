const express = require('express');
const router = express.Router();
const db = require('../models');

// Get all servers for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.userId; // We'll set this from middleware
    const servers = await db.Server.findAll({ where: { userId } });
    res.json(servers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new server
router.post('/', async (req, res) => {
  try {
    const { name, game, description, memory, disk, cpu, ports } = req.body;
    const userId = req.userId;
    const server = await db.Server.create({ name, game, description, memory, disk, cpu, ports, userId });
    res.status(201).json(server);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific server
router.get('/:id', async (req, res) => {
  try {
    const server = await db.Server.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }
    res.json(server);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a server
router.put('/:id', async (req, res) => {
  try {
    const { name, game, description, memory, disk, cpu, ports } = req.body;
    const server = await db.Server.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }
    await server.update({ name, game, description, memory, disk, cpu, ports });
    res.json(server);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a server
router.delete('/:id', async (req, res) => {
  try {
    const server = await db.Server.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }
    await server.destroy();
    res.json({ message: 'Server deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start a server (placeholder)
router.post('/:id/start', async (req, res) => {
  try {
    const server = await db.Server.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }
    // In a real app, you would start the server process here
    await server.update({ status: 'online' });
    res.json({ message: 'Server started', server });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Stop a server (placeholder)
router.post('/:id/stop', async (req, res) => {
  try {
    const server = await db.Server.findOne({ where: { id: req.params.id, userId: req.userId } });
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }
    // In a real app, you would stop the server process here
    await server.update({ status: 'offline' });
    res.json({ message: 'Server stopped', server });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;