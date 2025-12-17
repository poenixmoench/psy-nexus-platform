"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpServer = exports.app = void 0;
var express_1 = require("express");
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var logger_1 = require("./utils/logger");
var agents_controller_1 = require("./api/agents/agents.controller");
var orchestration_controller_1 = require("./api/orchestration/orchestration.controller");
var logger = (0, logger_1.createLogger)('Main');
var app = (0, express_1.default)();
exports.app = app;
var httpServer = (0, http_1.createServer)(app);
exports.httpServer = httpServer;
// Use Number() to ensure the port is a number
var PORT = Number(process.env.PORT || 3000);
app.use(express_1.default.json());
app.use('/api/agents', agents_controller_1.default);
app.use('/api/orchestration', orchestration_controller_1.default);
// Socket.IO setup (simplified from previous log analysis)
var io = new socket_io_1.Server(httpServer, {
    path: '/ws/orchestration',
    cors: { origin: '*', methods: ['GET', 'POST'] }
});
// Hier sollte die Socket-Logik eingefügt werden, um den Build zu ermöglichen.
httpServer.listen(PORT, function () {
    logger.info("Express Server running on port ".concat(PORT));
});
