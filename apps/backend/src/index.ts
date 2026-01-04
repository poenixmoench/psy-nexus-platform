import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { DialogAgent } from './agents/DialogAgent';

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const httpServer = createServer(app);
import { setupSocket } from './socket-config';
const io = setupSocket(httpServer);

const agents = [
  { name: 'ORION', role: 'Kommunikations-Assistent' },
  { name: 'PLAN-AGENT', role: 'Strukturierer' },
  { name: 'FRONTEND-MEISTER', role: 'HTML/Vue Coder' },
  { name: 'DESIGN-ALCHEMIST', role: 'CSS Master' },
  { name: 'BACKEND-ARCHITEKT', role: 'Server Master' },
  { name: 'QA-GURU', role: 'Quality Expert' },
  { name: 'OPTIMIERER', role: 'Performance Expert' },
  { name: 'DOKUMENTATION-AGENT', role: 'Knowledge Keeper' }
];

const dialogAgent = new DialogAgent(
  'dialog-main',
  'PSY-NEXUS Dialog',
  '💬',
  'Intelligenter Developer Assistant mit Qwen 2.5'
);

console.log('\n👥 8 AGENTEN AKTIV:');
agents.forEach((a, i) => console.log(`  ${i+1}. ${a.name} (${a.role})`));
console.log('\n✅ Status: PRODUCTION READY\n');

app.get('/api/agents', (req, res) => {
  res.json(agents);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', agents: agents.length });
});

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('send-message', async (data: any) => {
    try {
      const agentName = data.agent || 'ORION';
      const userMessage = data.text;
      
      console.log('📩 Message:', userMessage, 'von Agent:', agentName);

      console.log(`🤖 Calling DialogAgent for ${agentName}...`);
      const response = await dialogAgent.execute(userMessage);

      socket.emit('agent-message', {
        agent: agentName,
        text: response,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Response from ${agentName} sent`);

    } catch (error: any) {
      console.error('❌ Socket Error:', error.message);
      socket.emit('agent-message', {
        agent: data.agent || 'ORION',
        text: `❌ Fehler: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

httpServer.listen(3000, '127.0.0.1', () => {
  console.log('🚀 NEXUS SOCKET SERVER READY ON 3000');
});
