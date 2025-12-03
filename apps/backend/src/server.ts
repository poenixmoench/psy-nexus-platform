import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { WebSocketService } from './websocket/WebSocketService';
import agentRunRoutes from './routes/agentRunRoutes';

// Global WS Instance
export let wsServiceInstance: WebSocketService;

const app = express();
const server = createServer(app);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// WebSocket Service
wsServiceInstance = new WebSocketService(server);

// Routes - MUSS definiert sein!
if (agentRunRoutes) {
  app.use('/api/v2/run', agentRunRoutes);
} else {
  console.error('❌ agentRunRoutes undefined!');
}

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    wsConnections: wsServiceInstance.getActiveConnections(),
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Psy-Nexus Server on :${PORT}`);
  console.log(`🌐 WebSocket: ws://localhost:${PORT}/ws/run?runId=RUN_ID`);
});
