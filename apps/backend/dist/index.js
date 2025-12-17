import express from 'express';
import cors from 'cors';
import { Server as IOServer } from 'socket.io';
import { createLogger } from './utils/logger.js';
import agentsController from './api/agents/agents.controller.js';
import orchestrationController from './api/orchestration/orchestration.controller.js';
const app = express();
const logger = createLogger('Main');
app.use(cors());
app.use(express.json());
app.use('/api/agents', agentsController);
app.use('/api/orchestration', orchestrationController);
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'psy-nexus-backend',
        timestamp: new Date().toISOString()
    });
});
const PORT = parseInt(process.env.PORT || '3000', 10);
const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Express Server running on port ${PORT}`);
});
const io = new IOServer(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});
io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});
export default app;
//# sourceMappingURL=index.js.map