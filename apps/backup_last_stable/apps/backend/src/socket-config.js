"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = setupSocket;
const socket_io_1 = require("socket.io");
function setupSocket(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: { origin: '*', methods: ['GET', 'POST'] },
        transports: ['websocket', 'polling'],
        pingInterval: 60000,
        pingTimeout: 600000,
        maxHttpBufferSize: 1e6,
        // Force WebSocket upgrade
        upgradeTimeout: 10000,
        allowEIO3: true,
    });
    // Explicitly verify transports
    console.log(' [OK]  Socket.IO configured');
    return io;
}
