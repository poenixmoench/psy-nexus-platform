"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const tsyringe_1 = require("tsyringe");
const OrionOrchestrator_1 = require("../orchestrator/OrionOrchestrator");
const eventemitter2_1 = require("eventemitter2");
const events_1 = require("../types/events");
let SocketService = class SocketService {
    constructor(logger, orion, eventEmitter) {
        this.logger = logger;
        this.orion = orion;
        this.eventEmitter = eventEmitter;
        this.io = null;
    }
    init(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        this.io.on('connection', (socket) => {
            this.logger.info('SocketService', 'connection', `Client verbunden: ${socket.id}`);
            socket.on('agent_request', async (data) => {
                socket.on('test-gate-trigger', (data) => { this.io.emit('nexus_gate_reached', data); });
                try {
                    await this.orion.processRequestStreaming({
                        agent: data.agent,
                        input: data.input,
                        sessionData: data.sessionData
                    }, (chunk) => {
                        socket.emit('agent_response_chunk', { chunk });
                    });
                }
                catch (error) {
                    this.logger.error('SocketService', 'agent_request', 'Fehler bei Orion-Anfrage', error);
                    socket.emit('agent_error', { message: 'Fehler bei der Verarbeitung.' });
                }
            });
            socket.on('disconnect', () => {
                this.logger.info('SocketService', 'disconnect', `Client getrennt: ${socket.id}`);
            });
        });
        // Nexus Event Bridge: Leitet Backend-Events an Sockets weiter
        this.eventEmitter.on(events_1.NexusEvent.GATE_REACHED, (payload) => {
            this.logger.info('SocketService', 'NexusEvent', `Gate erreicht: ${payload.gateType}`);
            if (this.io) {
                this.io.emit('nexus_gate_reached', payload);
            }
        });
        this.logger.info('SocketService', 'init', 'Socket.io erfolgreich initialisiert.');
    }
};
exports.SocketService = SocketService;
exports.SocketService = SocketService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('Logger')),
    __param(1, (0, tsyringe_1.inject)(OrionOrchestrator_1.OrionOrchestrator)),
    __param(2, (0, tsyringe_1.inject)("EventEmitter")),
    __metadata("design:paramtypes", [Object, OrionOrchestrator_1.OrionOrchestrator,
        eventemitter2_1.EventEmitter2])
], SocketService);
// Permanent Fix für CommonJS/TS Interop
if (typeof module !== 'undefined') {
    module.exports.SocketService = SocketService;
}
