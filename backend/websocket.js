const { WebSocketServer } = require('ws');

const clients = new Map();

function initializeWebSocket(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('📡 WebSocket connected');
    let agentId = '';

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);

        if (!agentId && message.sender) {
          agentId = message.sender;
          clients.set(agentId, { ws, agentId, isAlive: true });
          console.log(`✅ Agent registered: ${agentId}`);

          broadcastToAll({
            type: 'system',
            sender: 'system',
            content: `Agent ${agentId} joined the network`,
            timestamp: Date.now()
          });
        }

        if (message.type === 'command' && message.receiver) {
          const targetClient = clients.get(message.receiver);
          if (targetClient) {
            targetClient.ws.send(JSON.stringify(message));
            console.log(`📤 ${message.sender} → ${message.receiver}: ${message.content.substring(0, 50)}`);
          }
        } else if (message.type === 'broadcast') {
          broadcastToAll(message);
        } else if (message.type === 'response') {
          const senderClient = clients.get(message.receiver || message.sender);
          if (senderClient) {
            senderClient.ws.send(JSON.stringify(message));
          }
        }
      } catch (error) {
        console.error('❌ WebSocket error:', error);
      }
    });

    ws.on('pong', () => {
      if (agentId && clients.has(agentId)) {
        const client = clients.get(agentId);
        client.isAlive = true;
      }
    });

    ws.on('close', () => {
      if (agentId) {
        clients.delete(agentId);
        console.log(`🔌 Agent disconnected: ${agentId}`);

        broadcastToAll({
          type: 'system',
          sender: 'system',
          content: `Agent ${agentId} left the network`,
          timestamp: Date.now()
        });
      }
    });

    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
  });

  // Heartbeat
  setInterval(() => {
    wss.clients.forEach((ws) => {
      const client = Array.from(clients.values()).find(c => c.ws === ws);
      if (client) {
        if (!client.isAlive) {
          ws.terminate();
          return;
        }
        client.isAlive = false;
        ws.ping();
      }
    });
  }, 30000);

  console.log('✅ WebSocket Server initialized');
}

function broadcastToAll(message) {
  const payload = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.ws.readyState === 1) {
      client.ws.send(payload);
    }
  });
}

function getConnectedAgents() {
  return Array.from(clients.keys());
}

function sendToAgent(agentId, message) {
  const client = clients.get(agentId);
  if (client && client.ws.readyState === 1) {
    client.ws.send(JSON.stringify(message));
    return true;
  }
  return false;
}

module.exports = { initializeWebSocket, getConnectedAgents, sendToAgent };
