"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const tsyringe_1 = require("tsyringe");
const OrionOrchestrator_1 = require("../orchestrator/OrionOrchestrator");
class SocketService {
    constructor() {
        this.orchestrator = tsyringe_1.container.resolve(OrionOrchestrator_1.OrionOrchestrator);
    }
    async handleIncoming(socketId, payload) {
        const request = {
            agent: payload.agent,
            input: payload.message || payload.query,
            userId: payload.userId
        };
        // Die Antwort wird hier direkt im Orchestrator auf Deutsch verarbeitet
        return await this.orchestrator.processRequestStreaming(request, () => { });
    }
}
exports.SocketService = SocketService;
