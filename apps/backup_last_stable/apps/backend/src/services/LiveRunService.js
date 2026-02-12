"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LiveRunService {
    broadcast(data) {
        console.log("Broadcast:", JSON.stringify(data));
    }
    async startStreamingSimulation(runId, agentName) {
        console.log(`Simulation started for ${agentName} (${runId})`);
        return true;
    }
    getAllRunIds() {
        return [];
    }
    getConnectionCount() {
        return 0;
    }
}
exports.default = new LiveRunService();
