"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const orchestrate_1 = __importDefault(require("./routes/orchestrate"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const agentRoutes_1 = __importDefault(require("./routes/agentRoutes"));
const app = (0, express_1.default)();
app.get("/api/health", (req, res) => res.json({ status: "online", service: "psy-nexus-core", timestamp: new Date().toISOString() }));
app.use((0, cors_1.default)({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express_1.default.json());
app.use('/api/agents', agentRoutes_1.default);
app.use('/api/orchestrate', orchestrate_1.default);
app.post('/api/agent/session/:id/task', (req, res) => {
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
const httpServer = http_1.default.createServer(app);
// SocketService.init(httpServer);
// Lese den Port aus der Umgebungsvariable, Fallback auf 3001
const PORT = parseInt(process.env.PORT || '3001', 10);
const startServer = (port = PORT) => {
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
exports.startServer = startServer;
exports.default = app;
