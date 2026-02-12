"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const AgentRepository_1 = require("../repositories/AgentRepository");
const AgentRegistry_1 = require("../agents/AgentRegistry");
class AgentService {
    constructor() {
        this.repository = new AgentRepository_1.AgentRepository();
    }
    async getAllAgents() {
        // Iteriere über AGENT_MAP und hole Metadaten
        const agents = [];
        for (const [key, AgentClass] of Object.entries(AgentRegistry_1.AGENT_MAP)) {
            // Type-Cast auf 'any', um TypeScript zu täuschen
            const typedClass = AgentClass;
            if (typedClass && typeof typedClass.metadata === 'object') {
                agents.push(typedClass.metadata);
            }
            else {
                // Fallback, falls Metadaten nicht verfügbar
                agents.push({
                    id: key,
                    name: key,
                    role: "Unbekannt",
                    description: "Keine Beschreibung verfügbar.",
                    category: "unknown",
                    status: 'inactive'
                });
            }
        }
        return agents;
    }
    async getAgentById(id) {
        // Versuche, direkt aus AGENT_MAP zu lesen
        const AgentClass = AgentRegistry_1.AGENT_MAP[id]; // Auch hier Type-Cast
        if (AgentClass && typeof AgentClass.metadata === 'object') {
            return AgentClass.metadata;
        }
        // Fallback auf Repository
        return await this.repository.findById(id);
    }
}
exports.AgentService = AgentService;
