"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
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
console.log("🛠️ Initialisiere PSY-NEXUS Infrastruktur...");
(0, container_1.setupDIContainer)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
app.use('/api/agent', agent_controller_1.default);
app.use('/api/agents', agents_controller_1.default);
app.get('/health', (req, res) => res.json({ status: 'online', system: 'PSY-NEXUS-CORE' }));
const httpServer = http_1.default.createServer(app);
const PORT = process.env.PORT || 3001;
httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 Server hört auf Port ${PORT}`);
    // Kleiner Timeout, um sicherzustellen, dass alle DI-Registrierungen im Speicher sind
    setTimeout(() => {
        try {
            console.log("💉 Injiziere Abhängigkeiten in den SocketService...");
            const socketService = tsyringe_1.container.resolve(SocketService_1.SocketService);
            socketService.init(httpServer);
            console.log("🔌 SOCKET-ENGINE AKTIVIERT: System ist scharfgeschaltet.");
        }
        catch (error) {
            console.error("❌ Kritischer Injektions-Fehler:", error);
        }
    }, 500);
});
