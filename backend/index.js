const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { WebSocketServer } = require('ws');

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

app.use(express.json());

// Models
const Agent = require('./src/models/Agent');
const Session = require('./src/models/Session');
const Message = require('./src/models/Message');
const Event = require('./src/models/Event');

// MongoDB Connection
let db = null;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/psy-nexus')
  .then(() => {
    db = mongoose.connection;
    console.log('✅ MongoDB Connected to:', process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  })
  .catch(err => console.error('❌ MongoDB Error:', err));

// Health & Ready
app.get('/health', (req, res) => res.json({ status: 'ok', db: db ? 'connected' : 'pending' }));
app.get('/ready', (req, res) => res.json({ ready: true, db: !!db }));

// Sessions API
app.post('/api/sessions', async (req, res) => {
  try {
    const { userId, title } = req.body;
    const session = new Session({ userId, title });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('messages');
    if (!session) return res.status(404).json({ error: 'Not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Messages API
app.post('/api/messages', async (req, res) => {
  try {
    const { sessionId, sender, receiver, content, type } = req.body;
    const message = new Message({ sessionId, sender, receiver, content, type });
    await message.save();
    await Session.findByIdAndUpdate(sessionId, { $push: { messages: message._id } });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Events API
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find({ isPublic: true }).sort({ date: 1 }).limit(50);
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== AGENT API ROUTES (BEFORE catch-all!) =====

// ===== STATIC FILES & SPA FALLBACK (LAST!) =====
// ===== AGENT API ROUTES (BEFORE STATIC) ====="
const agentRouter = require('./routes/agents');
const authRouter = require('./routes/auth');
app.use('/api/agents', agentRouter);
app.use('/api/auth', authRouter);

const publicPath = path.join(__dirname, 'public');
console.log('📁 Public path:', publicPath);

if (fs.existsSync(publicPath)) {
  console.log('✅ Serving static files from:', publicPath);
  app.use(express.static(publicPath));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/ready')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(publicPath, 'index.html'));
  });
} else {
  console.log('❌ Public directory not found:', publicPath);
  app.get('*', (req, res) => {
    res.status(404).json({ error: 'Frontend not deployed' });
  });
}

const server = http.createServer(app);

// WebSocket
const { initializeWebSocket } = require('./websocket');
initializeWebSocket(server);
console.log('✅ WebSocket Server initialized');

server.listen(port, host, () => {
  console.log(`✅ Backend listening on ${host}:${port}`);
  console.log(`✅ WebSocket enabled`);
  console.log(`✅ Static: ${publicPath}`);
  console.log('✅ Agent routes loaded');
});

process.on('unhandledRejection', (reason) => console.error('❌ Error:', reason));
