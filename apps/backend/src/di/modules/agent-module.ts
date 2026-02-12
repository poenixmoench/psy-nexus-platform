import { container } from 'tsyringe';
import { AGENT_MAP } from '../../agents/AgentRegistry';
import { AgentService } from '../../services/AgentService';

/**
 * Registriert alle Agenten und zugehörige Services im DI-Container.
 * Optimiert auf Performance (Caching der Länge) und Typsicherheit.
 */
export const registerAgents = (): void => {
    const agents = Object.entries(AGENT_MAP);
    const agentCount = agents.length;

    // 1. Massen-Registrierung der Agenten
    agents.forEach(([name, cls]) => {
        // Wir nutzen hier eine explizite Typ-Zuweisung für tsyringe
        container.register(name, { useClass: cls as any });
    });

    // 2. Registrierung des Core-Services
    container.register("AgentService", { useClass: AgentService });

    // 3. Bedingtes Logging für saubere Production-Logs
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[DI-VERSION-ALPHA-123] 🤖 ${agentCount} Agenten erfolgreich im System verankert.`);
    }
};
