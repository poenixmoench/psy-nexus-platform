import express from 'express';
import cors from 'cors';
import http from 'http';
import { SocketService } from './services/SocketService';
import agentRoutes from './routes/agentRoutes';

const app = express();
app.use(cors());
app.use(express.json());

// 1. Die NEUE dynamische PSY-NEXUS Route
app.use('/api/agents', agentRoutes);

// 2. Task-Endpoint (behalten wir bei für die Logik)
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
  console.log(`🚀 PSY-NEXUS Backend Core Running on Port ${PORT}`);
});

export default app;
