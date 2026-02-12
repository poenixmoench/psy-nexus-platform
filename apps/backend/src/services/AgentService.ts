import { AgentRepository } from '../repositories/AgentRepository';
import { IAgent } from '../types/Agent';
import { AGENT_MAP } from '../agents/AgentRegistry';

export class AgentService {
  private repository = new AgentRepository();

  async getAllAgents(): Promise<IAgent[]> {
    // Iteriere über AGENT_MAP und hole Metadaten
    const agents: IAgent[] = [];
    for (const [key, AgentClass] of Object.entries(AGENT_MAP)) {
      // Type-Cast auf 'any', um TypeScript zu täuschen
      const typedClass: any = AgentClass;
      if (typedClass && typeof typedClass.metadata === 'object') {
        agents.push(typedClass.metadata);
      } else {
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

  async getAgentById(id: string) {
    // Versuche, direkt aus AGENT_MAP zu lesen
    const AgentClass: any = AGENT_MAP[id]; // Auch hier Type-Cast
    if (AgentClass && typeof AgentClass.metadata === 'object') {
      return AgentClass.metadata;
    }
    // Fallback auf Repository
    return await this.repository.findById(id);
  }
}
