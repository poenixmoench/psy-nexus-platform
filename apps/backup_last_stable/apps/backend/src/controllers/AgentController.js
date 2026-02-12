"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentController = void 0;
class AgentController {
    static async getAllAgents(req, res) {
        res.json({ agents: 8, status: 'ok' });
    }
    static async getAgentStatus(req, res) {
        const { id } = req.params;
        res.json({ success: true, agentId: id, status: 'active' });
    }
}
exports.AgentController = AgentController;
