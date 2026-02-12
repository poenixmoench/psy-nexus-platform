"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
require("module-alias/register");
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const container_1 = require("./di/container");
const agent_controller_1 = __importDefault(require("./controllers/agent.controller"));
const agents_controller_1 = __importDefault(require("./controllers/agents.controller"));
const SocketService_1 = require("./services/SocketService");
(0, container_1.setupDIContainer)();
const app = (0, express_1.default)();
app.use((req, res, next) => {
    const reqId = req.headers['x-request-id'] || 'local-dev';
    console.log(`[${new Date().toISOString()}] [REQ-ID: ${reqId}] ${req.method} ${req.url}`);
    next();
});
// ROBUSTE PFAD-LOGIK FÜR DEINE STRUKTUR
const publicPath = path_1.default.resolve(__dirname, '..', 'public');
console.log(`📂 Erwarteter Public-Pfad: ${publicPath}`);
if (!fs_1.default.existsSync(publicPath)) {
    console.error("⚠️ WARNUNG: Public Ordner nicht gefunden unter:", publicPath);
}
app.use(express_1.default.static(publicPath));
app.use((0, cors_1.default)({ origin: "*" }));
app.use(express_1.default.json());
// API Routen - Wir registrieren sie doppelt, um Nginx-Präfixe abzufangen
app.use('/api/agent', agent_controller_1.default);
app.use('/agent', agent_controller_1.default);
app.use('/api/agents', agents_controller_1.default);
app.use('/agents', agents_controller_1.default);
app.get(['/api/health', '/health'], (req, res) => {
    res.json({ status: 'online', system: 'PSY-NEXUS-CORE', timestamp: new Date().toISOString() });
});
const httpServer = http_1.default.createServer(app);
const PORT = process.env.PORT || 3001;
app.get("*", (req, res) => {
    const indexPath = path_1.default.join(publicPath, "index.html");
    if (fs_1.default.existsSync(indexPath)) {
        res.sendFile(indexPath);
    }
    else {
        res.status(404).json({ error: "Frontend Assets missing", path: indexPath });
    }
});
httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Server aktiv auf Port ${PORT}`);
    setTimeout(() => {
        try {
            const socketService = tsyringe_1.container.resolve(SocketService_1.SocketService);
            socketService.init(httpServer);
            console.log("🔌 SOCKET-ENGINE AKTIVIERT.");
        }
        catch (error) {
            console.error("❌ Socket-Fehler:", error);
        }
    }, 500);
});
