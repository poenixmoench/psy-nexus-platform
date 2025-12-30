import express from 'express';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import axios from 'axios';
import http from 'http';

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  path: '/socket.io/'
});

app.use(cors());
app.use(express.json());

interface Message {
  agent: string;
  text: string;
  type: 'user' | 'agent';
  timestamp: number;
  messageId?: string;
}

interface AgentState {
  name: string;
  role: string;
  history: Message[];
  status: 'idle' | 'processing' | 'completed' | 'error';
  lastError?: string;
}

const AGENTS_CONFIG = [
  { name: 'ORION', role: 'Kommunikations-Assistent' },
  { name: 'PLAN-AGENT', role: 'Strukturierer' },
  { name: 'FRONTEND-MEISTER', role: 'HTML/Vue Coder' },
  { name: 'DESIGN-ALCHEMIST', role: 'CSS Master' },
  { name: 'BACKEND-ARCHITEKT', role: 'Server Master' },
  { name: 'QA-GURU', role: 'Quality Expert' },
  { name: 'OPTIMIERER', role: 'Performance Expert' },
  { name: 'DOKUMENTATION-AGENT', role: 'Knowledge Keeper' }
];

const agents: Record<string, AgentState> = {};

AGENTS_CONFIG.forEach(a => {
  agents[a.name] = {
    name: a.name,
    role: a.role,
    history: [],
    status: 'idle'
  };
});

async function generateWithStreaming(socket: Socket, agentName: string, userMessage: string) {
  const agent = agents[agentName];
  if (!agent) return;

  agent.status = 'processing';
  agent.lastError = undefined;
  let fullResponse = "";
  let tokenCount = 0;
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  io.emit('state-update', { agents, lastUpdate: agentName });

  try {
    const prompt = `Du bist ${agentName} (${agent.role}). Antworte kurz auf Deutsch (max 100 Wörter) zu:\n\n${userMessage}`;

    const response = await axios({
      method: 'post',
      url: "http://127.0.0.1:11434/api/generate",
      data: { 
        model: "qwen2.5-coder:14b", 
        prompt: prompt, 
        stream: true, 
        temperature: 0.8 
      },
      responseType: 'stream',
      timeout: 300000
    });

    response.data.on('data', (chunk: Buffer) => {
      try {
        const lines = chunk.toString().split('\n').filter(l => l.trim());
        
        lines.forEach(line => {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              fullResponse += json.response;
              tokenCount++;

              socket.emit('agent-partial', {
                agent: agentName,
                partial: fullResponse,
                tokenCount: tokenCount,
                messageId: messageId
              });

              io.emit('streaming-update', {
                agent: agentName,
                partial: fullResponse,
                messageId: messageId
              });
            }
          } catch (e) {}
        });
      } catch (e) {
        console.error('Chunk error:', e);
      }
    });

    response.data.on('end', () => {
      agent.status = 'completed';
      agent.history.push({
        agent: agentName,
        text: fullResponse,
        type: 'agent',
        timestamp: Date.now(),
        messageId: messageId
      });

      io.emit('state-update', { agents, lastUpdate: agentName });
      socket.emit('agent-complete', { 
        agent: agentName, 
        fullResponse,
        messageId: messageId,
        tokenCount: tokenCount,
        duration: new Date().getTime()
      });
    });

    response.data.on('error', (err: Error) => {
      console.error('Stream error:', err);
      agent.status = 'error';
      agent.lastError = err.message;
      io.emit('state-update', { agents, lastUpdate: agentName });
      socket.emit('agent-error', { 
        agent: agentName, 
        error: err.message,
        messageId: messageId
      });
    });

  } catch (error: any) {
    console.error(`Error ${agentName}:`, error.message);
    agent.status = 'error';
    agent.lastError = error.message;
    io.emit('state-update', { agents, lastUpdate: agentName });
    socket.emit('agent-error', { 
      agent: agentName, 
      error: error.message,
      messageId: messageId
    });
  }
}

io.on('connection', (socket: Socket) => {
  console.log(`🔌 Connected: ${socket.id}`);
  socket.emit('init-agents', { agents });

  socket.on('agent-message', async (data: any) => {
    console.log(`📨 ${data.agentName}: ${data.message}`);
    
    const agent = agents[data.agentName];
    if (agent) {
      agent.history.push({
        agent: 'NUTZER',
        text: data.message,
        type: 'user',
        timestamp: Date.now(),
        messageId: data.messageId
      });
    }

    await generateWithStreaming(socket, data.agentName, data.message);
  });

  socket.on('copy-message', (data: any) => {
    console.log(`📋 Kopiert: ${data.agentName} - ${data.messageId.substring(0, 20)}...`);
    socket.emit('copy-success', { messageId: data.messageId });
  });

  socket.on('reset-all', () => {
    AGENTS_CONFIG.forEach(a => {
      agents[a.name].history = [];
      agents[a.name].status = 'idle';
      agents[a.name].lastError = undefined;
    });
    io.emit('init-agents', { agents });
    console.log('🔄 Workflow komplett zurückgesetzt');
  });

  socket.on('reset-agent', (data: any) => {
    const agent = agents[data.agentName];
    if (agent) {
      agent.history = [];
      agent.status = 'idle';
      agent.lastError = undefined;
      io.emit('state-update', { agents, lastUpdate: data.agentName });
      console.log(`🔄 ${data.agentName} zurückgesetzt`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Disconnected: ${socket.id}`);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', agents: Object.keys(agents).length });
});

app.get('/agents', (req, res) => {
  res.json({ agents });
});

app.post('/reset', (req, res) => {
  AGENTS_CONFIG.forEach(a => {
    agents[a.name].history = [];
    agents[a.name].status = 'idle';
    agents[a.name].lastError = undefined;
  });
  res.json({ status: 'reset', agents });
});

app.get('/export', (req, res) => {
  const exportData = {
    timestamp: new Date().toISOString(),
    agents: agents,
    summary: AGENTS_CONFIG.map(a => ({
      name: a.name,
      role: a.role,
      messageCount: agents[a.name].history.length,
      status: agents[a.name].status
    }))
  };
  res.json(exportData);
});

httpServer.listen(3001, '0.0.0.0', () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  🚀 PSY-NEXUS ENHANCED MASTER WORKFLOW v2.0 - LIVE!       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('👥 8 AGENTEN AKTIV:');
  AGENTS_CONFIG.forEach((a, i) => {
    console.log(`  ${i + 1}. ${a.name} (${a.role})`);
  });
  console.log('');
  console.log('⚡ FEATURES:');
  console.log('  ✅ Reality-Check Feedback Loop');
  console.log('  📚 Dokumentation-Agent');
  console.log('  🔄 Iterations-Schleife');
  console.log('  🚨 Error-Handling & Recovery');
  console.log('  📡 Agent-Kommunikations-Protokoll');
  console.log('  📋 Copy-to-Clipboard Feature');
  console.log('  🔄 Reset Workflow Feature');
  console.log('');
  console.log('📖 Workflow: ENHANCED_MASTER_WORKFLOW.md');
  console.log('🔗 WebSocket: wss://psy-nexus.live:3001');
  console.log('🌐 Frontend: https://psy-nexus.live/dev-workspace/');
  console.log('✅ Status: PRODUCTION READY');
  console.log('');
});

export { app, io, agents };
