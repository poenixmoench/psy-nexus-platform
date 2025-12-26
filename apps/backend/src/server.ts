import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { WebSocketService } from './websocket/WebSocketService';
import historyRoutes from './routes/history-routes';

// Der fehlende Export für AgentRunService
export let wsServiceInstance: WebSocketService;

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

// Initialisiere WebSocket vor den Routen
wsServiceInstance = new WebSocketService(server);

// Mount der History-Routen auf Root, da diese intern /api nutzen
app.use('/', historyRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Debug-Funktion zur Routen-Auflistung
const listRoutes = (stack: any[], parent = '') => {
  stack.forEach((r: any) => {
    if (r.route) {
      console.log(`📍 Route gefunden: ${parent}${r.route.path}`);
    } else if (r.name === 'router' && r.handle.stack) {
      let path = r.regexp.source.replace('^\\', '').replace('\\/?(?=\\/|$)', '');
      listRoutes(r.handle.stack, parent + path);
    }
  });
};

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Psy-Nexus Server online auf Port ${PORT}`);
  console.log('--- Registrierte Routen ---');
  if (app._router && app._router.stack) {
    listRoutes(app._router.stack);
  }
  console.log('---------------------------');
});
