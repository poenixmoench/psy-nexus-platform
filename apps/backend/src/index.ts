import "module-alias/register";
import "module-alias/register";
import 'reflect-metadata';
import { container } from 'tsyringe';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { setupDIContainer } from './di/container';
import agentController from './controllers/agent.controller';
import agentsRouter from './controllers/agents.controller';
import { SocketService } from './services/SocketService';

console.log("🛠️ Initialisiere PSY-NEXUS Infrastruktur...");
setupDIContainer();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/agent', agentController);
app.use('/api/agents', agentsRouter);
app.get('/health', (req, res) => res.json({ status: 'online', system: 'PSY-NEXUS-CORE' }));

const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3001;

httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Server hört auf Port ${PORT}`);
  
  // Kleiner Timeout, um sicherzustellen, dass alle DI-Registrierungen im Speicher sind
  setTimeout(() => {
    try {
      console.log("💉 Injiziere Abhängigkeiten in den SocketService...");
      const socketService = container.resolve(SocketService);
      socketService.init(httpServer);
      console.log("🔌 SOCKET-ENGINE AKTIVIERT: System ist scharfgeschaltet.");
    } catch (error) {
      console.error("❌ Kritischer Injektions-Fehler:", error);
    }
  }, 500);
});
