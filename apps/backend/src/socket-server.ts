const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  path: '/socket.io/'
});

// Typen für TS explizit auf "any" gesetzt, um TS7006 zu verhindern
io.on('connection', (socket: any) => {
  console.log('🔌 Socket verbunden:', socket.id);

  socket.on('agent-message', async (data: any) => {
    console.log('📨 Nachricht erhalten, leite an Orchestrator weiter...', data.agentName);
    
    try {
      const response = await axios({
        method: 'post',
        url: 'http://localhost:3001/api/orchestrate/stream',
        data: {
          input: data.message,
          agent: data.agentName + '_AGENT',
          workflowId: data.workflowId || null
        },
        responseType: 'stream'
      });

      response.data.on('data', (chunk: any) => {
        const lines = chunk.toString().split('\n').filter((l: any) => l.trim() !== '');
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          
          const jsonPart = line.replace(/^data:\s*/, '');
          if (jsonPart === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonPart);
            if (parsed.content) socket.emit('agent-chunk', { content: parsed.content });
            if (parsed.workflowId) socket.emit('workflow-id', { workflowId: parsed.workflowId });
          } catch (e) {
            // Unvollständige JSON-Chunks still ignorieren
          }
        }
      });

      response.data.on('end', () => {
        socket.emit('agent-finished', { agent: data.agentName });
      });

    } catch (error: any) {
      console.error('❌ Proxy-Fehler:', error.message);
      socket.emit('agent-error', { message: 'Kern-Verbindung fehlgeschlagen.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket getrennt');
  });
});

const PORT = 3003;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TITAN-PROXY ONLINE auf Port ${PORT}`);
});
