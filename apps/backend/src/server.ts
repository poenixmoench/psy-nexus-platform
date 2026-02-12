import orchestrateRoutes from './routes/orchestrate';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { SocketService } from './services/SocketService';
import agentRoutes from './routes/agentRoutes';

const app = express();
app.get("/api/health", (req, res) => res.json({ status: "online", service: "psy-nexus-core", timestamp: new Date().toISOString() }));
app.use(cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

app.use('/api/agents', agentRoutes);
app.use('/api/orchestrate', orchestrateRoutes);

app.post('/api/agent/session/:id/task', (req: any, res: any) => {
  const { id } = req.params;
  const { task } = req.body;
  res.json({
    sessionId: id,
    taskId: Date.now(),
    status: 'processing',
    message: `Task initiated: ${task}`,
    timestamp: new Date().toISOString()
  });
});

const httpServer = http.createServer(app);
// SocketService.init(httpServer);

// Lese den Port aus der Umgebungsvariable, Fallback auf 3001
const PORT = parseInt(process.env.PORT || '3001', 10);

export const startServer = (port: number = PORT) => {
  return new Promise((resolve, reject) => {
    httpServer.listen(port, () => {
      console.log(` [ROCKET] PSY-NEXUS Backend Core Running on Port ${port}`);
      resolve(true);
    }).on('error', (err) => {
      console.error(` [ERROR] Could not start server on Port ${port}:`, err);
      reject(err);
    });
  });
};

export default app;
