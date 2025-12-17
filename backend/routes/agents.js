const express = require('express');
const Agent = require('../src/models/Agent');
const { getConnectedAgents, sendToAgent } = require('../websocket');
const router = express.Router();

// SPECIFIC ROUTES FIRST!
router.get('/status/connected', (req, res) => {
  const connected = getConnectedAgents();
  res.json({ connected: connected.length, agents: connected, timestamp: new Date() });
});

// THEN GENERIC ROUTES
router.get('/list', async (req, res) => {
  try {
    const agents = await Agent.find().lean();
    const connected = getConnectedAgents();
    const agentsWithStatus = agents.map(agent => ({
      ...agent,
      isConnected: connected.includes(agent.id),
      lastSeen: new Date()
    }));
    res.json(agentsWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const agent = await Agent.findOne({ id: req.params.id }).lean();
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    const connected = getConnectedAgents();
    res.json({ ...agent, isConnected: connected.includes(agent.id), lastSeen: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/command', async (req, res) => {
  try {
    const { command } = req.body;
    const agent = await Agent.findOne({ id: req.params.id });
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    const success = sendToAgent(req.params.id, {
      type: 'command',
      sender: 'api',
      receiver: req.params.id,
      content: command,
      timestamp: Date.now()
    });
    res.json({ success, command, agentId: req.params.id, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
