"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const ws_1 = require("ws");
class WebSocketService {
    constructor(server) {
        this.clients = new Set();
        this.wss = new ws_1.Server({ noServer: true });
        server.on('upgrade', (request, socket, head) => {
            if (request.url?.startsWith('/ws/run')) {
                this.wss.handleUpgrade(request, socket, head, (ws) => {
                    this.handleConnection(ws, request.url);
                });
            }
            else {
                socket.destroy();
            }
        });
    }
    handleConnection(ws, url) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const runId = urlParams.get('runId');
        if (!runId) {
            ws.close(1008, 'Missing runId parameter.');
            return;
        }
        const client = { ws, runId };
        this.clients.add(client);
        console.log(`🌐 [WS] Client: ${runId} (Total: ${this.clients.size})`);
        ws.send(JSON.stringify({ type: 'STATUS_INIT', runId, timestamp: new Date().toISOString() }));
        ws.on('close', () => {
            this.clients.delete(client);
            console.log(`🌐 [WS] Disconnected: ${runId}`);
        });
    }
    broadcast(runId, data) {
        const payload = JSON.stringify({ runId, timestamp: new Date().toISOString(), data });
        let sent = 0;
        for (const client of this.clients) {
            if (client.runId === runId && client.ws.readyState === ws_1.WebSocket.OPEN) {
                try {
                    client.ws.send(payload);
                    sent++;
                }
                catch (error) {
                    console.error(` [ERR]  WS Send failed: ${error}`);
                    client.ws.close();
                }
            }
        }
        if (sent > 0)
            console.log(` [DEBUG]  [WS] Broadcast ${runId}: ${sent} clients`);
    }
    getActiveConnections() {
        return this.clients.size;
    }
}
exports.WebSocketService = WebSocketService;
