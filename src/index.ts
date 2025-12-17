import express from 'express';
import { Server } from 'socket.io';
import { logger } from './utils/logger.js';
import { agentsRouter } from './api/agents/agents.controller.js';
import { orchestrationRouter } from './api/orchestration/orchestration.controller.js';

// Setup Express App, MongoDB connection, etc.
const app = express();
const httpServer = createServer(app); // Annahme: createServer wird von 'http' importiert
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// ... weiterer Code ...

