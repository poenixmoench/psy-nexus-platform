"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const agentRoutes_1 = __importDefault(require("./routes/agentRoutes"));
const CORE_URL = process.env.CORE_URL || 'http://localhost:3001';
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Hier binden wir die Route ein, die den 404 killt
app.use('/api/agents', agentRoutes_1.default);
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
exports.io = io;
io.on('connection', (socket) => {
    console.log('🔌 Socket-Verbindung hergestellt:', socket.id);
    socket.on('agent-message', async (data) => {
        const agentName = data.agentName || data.agent || 'Orion';
        const userPrompt = data.message || data.prompt;
        if (!userPrompt) {
            socket.emit('agent-error', { message: 'Kein Prompt erhalten.' });
            return;
        }
        try {
            const config = {
                method: 'post',
                url: `${CORE_URL}/api/agents/chat`,
                data: { agentName, prompt: userPrompt },
                responseType: 'stream',
                timeout: 300000,
            };
            const coreResponse = await (0, axios_1.default)(config);
            let buffer = '';
            let doneEmitted = false;
            coreResponse.data.on('data', (chunk) => {
                buffer += chunk.toString();
                let newlineIndex;
                while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                    const line = buffer.substring(0, newlineIndex).trim();
                    buffer = buffer.substring(newlineIndex + 1);
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonData = JSON.parse(line.substring(6));
                            socket.emit('agent-chunk', {
                                agent: agentName,
                                chunk: jsonData.response || jsonData.chunk || '',
                                sessionId: socket.id
                            });
                        }
                        catch (e) { }
                    }
                }
            });
            coreResponse.data.on('end', () => {
                if (!doneEmitted) {
                    socket.emit('agent-done', { success: true });
                    doneEmitted = true;
                }
            });
        }
        catch (error) {
            socket.emit('agent-error', { message: error.message });
        }
    });
    socket.on('disconnect', (reason) => {
        console.log('🔌 Socket-Verbindung getrennt:', socket.id, 'Grund:', reason);
    });
});
server.listen(3002, () => {
    console.log(`🔗 Psy-socket-gateway (API + Streaming) läuft auf Port 3002`);
});
