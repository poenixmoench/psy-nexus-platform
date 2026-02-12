"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRepository = void 0;
class AgentRepository {
    constructor() {
        this.agents = [
            {
                id: 'master-agent-1',
                name: 'Nexus Koordinator',
                role: 'Master Orchestrator',
                description: 'Koordiniert 7-Agenten Workflow'
            }
        ];
    }
    async getAgentByName(name) {
        return this.agents.find(a => a.name === name) || null;
    }
    async findAll() {
        return this.agents;
    }
    async findById(id) {
        return this.agents.find(a => a.id === id) || null;
    }
    async create(data) {
        this.agents.push(data);
        return data;
    }
    async update(id, data) {
        const index = this.agents.findIndex(a => a.id === id);
        if (index === -1)
            return null;
        this.agents[index] = { ...this.agents[index], ...data };
        return this.agents[index];
    }
    async delete(id) {
        const initialLength = this.agents.length;
        this.agents = this.agents.filter(a => a.id !== id);
        return this.agents.length < initialLength;
    }
}
exports.AgentRepository = AgentRepository;
