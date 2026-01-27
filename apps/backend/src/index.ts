import "reflect-metadata";
import http from 'http';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
// Korrigierter Importpfad für den DI-Container
import { container } from './di/index'; 

// DI-Container Setup
import { setupDIContainer } from './di/container';

// Eigene Module
import { connectDB } from './db/connection';
import { authRoutes } from './routes/authRoutes';
import { eventRoutes } from './routes/eventRoutes';
import { healthRoutes } from './routes/health';
import agentRoutes from './routes/agentRoutes';
import orchestrateRoutes from './routes/orchestrate';
import publishRoutes from './routes/publishRoutes';

// DI initialisieren
setupDIContainer();

const app = express();

// Konfiguration der express-Instanz
app.set('trust proxy', true); // Wenn Nginx als Proxy läuft
app.use(cors());
// JSON Parser mit Limit, um DoS zu verhindern
app.use(express.json({ limit: '10mb' }));

// --- Globale Fehlerbehandlung ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const logger = container.resolve<any>('Logger'); // Typisierung anpassen
  logger.error('Unbehandelter Fehler im Express-Handler:', err);
  res.status(500).json({ success: false, message: 'Interner Serverfehler.' });
});

// API-Routen
app.use('/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/orchestrate', orchestrateRoutes);
app.use('/api/publish', publishRoutes);
app.use('/api/health', healthRoutes);

const httpServer = http.createServer(app);

async function startServer() {
  try {
    const logger = container.resolve<any>('Logger'); // Typisierung anpassen
    await connectDB();
    logger.info('✅ Datenbank-Check erfolgreich.');

    // Optional: Ollama Verfügbarkeit prüfen
    // const ollamaAvailable = await checkOllamaConnection(); // Implementierung nötig
    // if (!ollamaAvailable) {
    //   logger.warn('⚠️ Warnung: Ollama-Verbindung nicht verfügbar.');
    // }

    const PORT = parseInt(process.env.PORT || '3001', 10);
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Psy-backend-core läuft auf Port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Kritischer Fehler beim Serverstart:', err);
    process.exit(1);
  }
}

let isShuttingDown = false;
async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n${signal} received. Shutting down gracefully...`);
  const logger = container.resolve<any>('Logger'); // Typisierung anpassen

  httpServer.close(async () => {
    logger.info('HTTP Server closed.');
    // Optional: DB-Verbindung schließen, etc.
    // await closeDBConnection();
    logger.info('Closed out remaining connections.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if server hasn't closed
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
