const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.post('/agent-message', async (req, res) => {
  const data = req.body;
  console.log('[SOCKET REST] Request for:', data.agentName);
  res.status(202).json({ status: 'Processing' });
  handleAgentRequest(null, data);
});

async function handleAgentRequest(socket, data) {
  try {
    const response = await axios({
      method: 'post',
      url: 'http://localhost:3001/agents/chat/stream',
      data: { agent: data.agentName, message: data.message, workflowId: data.workflowId || null },
      responseType: 'stream'
    });

    let lineBuffer = '';
    response.data.on('data', (chunk) => {
      lineBuffer += chunk.toString();
      const lines = lineBuffer.split('\n');
      lineBuffer = lines.pop();
      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data:')) continue;
        const value = line.replace(/^\s*/, '').trim();
        if (value === '[DONE]') continue;
        try {
          const parsed = JSON.parse(value);
          const content = parsed.content || (parsed.message && parsed.message.content) || '';
          if (content && socket) socket.emit('agent-chunk', { content });
        } catch (e) {}
      }
    });
    response.data.on('end', () => {
      if (socket) socket.emit('agent-done', { agent: data.agentName });
    });
  } catch (err) {
    console.error('[SOCKET] Error:', err.message);
  }
}

io.on('connection', (socket) => {
  console.log('[SOCKET] Connected:', socket.id);
  socket.on('agent-message', (data) => handleAgentRequest(socket, data));
});

server.listen(3002, '0.0.0.0', () => console.log('[SOCKET] Listening on 3002'));
