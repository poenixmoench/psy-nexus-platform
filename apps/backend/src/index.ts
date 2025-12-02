import cors from 'cors';
import { wsConnections } from './routes/history-routes';
import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import { connectDB } from './db/connection';
import { setupEventTable } from './db/eventQueries';
import authRoutes from './routes/authRoutes';
import historyRouter from './routes/history-routes';
import eventRoutes from './routes/eventRoutes';
import agentRoutes from './routes/agentRoutes';

const app = express();

async function initializeApp() {
  try {
    await connectDB();
    console.log('Database connected successfully.');
    await setupEventTable();
    console.log('Database tables checked/created.');
  } catch (err) {
    console.error('Failed to initialize app:', err);
    process.exit(1);
  }
}

initializeApp().then(() => {
  // Middleware
  app.use(express.json());
  app.use(cors());

  // Health Check Route
  app.get('/api/health', (req, res) => {
    res.status(200).send({ status: 'OK', message: 'Backend is running' });
  });

  // Routes
  app.use('/auth', authRoutes);
  app.use(historyRouter);
  app.use('/api/events', eventRoutes);
  app.use('/api/agents', agentRoutes);

  // ✅ WICHTIG: Nutze http.createServer statt app.listen
  const server = http.createServer(app);

  // ✅ WICHTIG: Initialisiere WebSocketServer
  const wss = new WebSocketServer({ noServer: true });

  // ✅ WICHTIG: Registriere upgrade Handler
  server.on('upgrade', (req, socket, head) => {
    const url = req.url;
    if (url?.startsWith('/ws/')) {
      wss.handleUpgrade(req, socket, head, (ws) => {
        const runId = url.replace('/ws/', '');
        console.log(`[WebSocket] Upgrade Request: ${url}`);
        
        // Registriere Connection
        wsConnections.set(runId, ws);
        console.log(`[WebSocket] 🔗 Neue Verbindung: ${runId}`);
        console.log(`[WebSocket] ✅ Registriert in Map - Size: ${wsConnections.size}`);

        ws.on('close', () => {
          wsConnections.delete(runId);
          console.log(`[WebSocket] ❌ Verbindung geschlossen: ${runId}`);
        });

        ws.on('error', (error) => {
          console.error(`[WebSocket] Error für ${runId}:`, error);
          wsConnections.delete(runId);
        });
      });
    } else {
      socket.destroy();
    }
  });

  // ✅ FIX: PORT als number definieren
  const PORT: number = parseInt(process.env.PORT || '3001', 10);
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log('WebSocket Server bereit auf ws://localhost:3001/ws/:runId');
  });
});

export default app;
