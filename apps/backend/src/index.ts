import express from 'express';
import cors from 'cors';
import http from 'http';
import { SocketService } from './services/SocketService';
import agentRoutes from './routes/agentRoutes';

const app = express();
app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Die NEUE dynamische PSY-NEXUS Route
app.use('/api/agents', agentRoutes);

// Task-Endpoint
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
SocketService.init(httpServer);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(` [ROCKET]  PSY-NEXUS Backend Core Running on Port ${PORT}`);
});

export default app;
