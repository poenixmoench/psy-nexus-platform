"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAgents = void 0;
const tsyringe_1 = require("tsyringe");
const AgentRegistry_1 = require("../../agents/AgentRegistry");
const AgentService_1 = require("../../services/AgentService");
/**
 * Registriert alle Agenten und zugehörige Services im DI-Container.
 * Optimiert auf Performance (Caching der Länge) und Typsicherheit.
 */
const registerAgents = () => {
    const agents = Object.entries(AgentRegistry_1.AGENT_MAP);
    const agentCount = agents.length;
    // 1. Massen-Registrierung der Agenten
    agents.forEach(([name, cls]) => {
        // Wir nutzen hier eine explizite Typ-Zuweisung für tsyringe
        tsyringe_1.container.register(name, { useClass: cls });
    });
    // 2. Registrierung des Core-Services
    tsyringe_1.container.register("AgentService", { useClass: AgentService_1.AgentService });
    // 3. Bedingtes Logging für saubere Production-Logs
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[DI-VERSION-ALPHA-123] 🤖 ${agentCount} Agenten erfolgreich im System verankert.`);
    }
};
exports.registerAgents = registerAgents;
