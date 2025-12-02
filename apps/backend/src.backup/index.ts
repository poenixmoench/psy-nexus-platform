import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import WebSocket from 'ws';
import orchestrateRouter from './routes/orchestrate';
import historyRouter from './routes/history-routes';
import LiveRunService from './services/LiveRunService';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const ts = new Date().toISOString();
  const method = req.method.toUpperCase();
  const path = req.path;
  console.log(`[${ts}] ${method} ${path}`);
  next();
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'psy-nexus-backend',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

console.log('[Router] Registering orchestrateRouter...');
app.use('/', orchestrateRouter);

console.log('[Router] Registering historyRouter...');
app.use('/', historyRouter);

app.use((req: Request, res: Response) => {
  console.warn('[404] ' + req.method + ' ' + req.path);
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', {
    message: err.message,
    method: req.method,
    path: req.path,
  });
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: err.message,
    path: req.path,
  });
});

const server = http.createServer(app);

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws: WebSocket) => {
  console.log('[WebSocket] Neue Verbindung hergestellt');
});

server.on('upgrade', (request, socket, head) => {
  const pathname = request.url;
  console.log('[WebSocket] Upgrade-Anfrage für Pfad:', pathname);

  if (pathname && pathname.startsWith('/ws/live/')) {
    const runId = pathname.split('/')[3];
    
    if (!runId) {
      console.error('[WebSocket] Keine runId in Upgrade-Anfrage');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
      console.log(`[WebSocket] Upgrade erfolgreich für runId: ${runId}`);
      wss.emit('connection', ws, request);
      LiveRunService.registerConnection(runId, ws);
    });
  } else {
    console.warn('[WebSocket] Ungültiger Upgrade-Pfad, verbindung abgebrochen');
    socket.destroy();
  }
});

server.listen(port, () => {
  console.log(`[Server] Server läuft auf Port ${port}`);
  console.log('[Server] WebSocket-Server bereit auf ws://localhost:' + port + '/ws/live/:runId');
  console.log('[Startup] Alle Router registriert und bereit');
});

export default app;
