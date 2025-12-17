const WebSocket = require('ws');
const orchestrator = require('./orchestrator');

const initializeWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    console.log('🌐 Client connected via WebSocket');
    let clientId = Math.random().toString(36).substr(2, 9);

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`📥 [${clientId}] Message type: ${data.type}`);
        
        await orchestrator.handleIncomingMessage(data, ws);
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          sender: 'system',
          content: 'Fehler bei der Nachrichtenverarbeitung.'
        }));
      }
    });

    ws.on('close', () => {
      console.log(`❌ [${clientId}] Client disconnected`);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket Error [${clientId}]:`, error.message);
    });

    // Willkommensnachricht
    ws.send(JSON.stringify({
      type: 'system',
      sender: 'orion',
      content: 'ORION: Verbunden mit dem Agenten-Orchestrator. Bereit zum Start. [OK]'
    }));
  });

  console.log('✅ WebSocket Server initialized');
};

module.exports = initializeWebSocket;
