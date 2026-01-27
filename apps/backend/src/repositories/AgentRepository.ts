export interface IAgent {
  id: string;
  name: string;
  role: string;
  description: string;
}

export class AgentRepository {
  private agents: IAgent[] = [
    {
      id: 'master-agent-1',
      name: 'Nexus Koordinator',
      role: 'Master Orchestrator',
      description: 'Koordiniert 7-Agenten Workflow'
    }
  ];

  async getAgentByName(name: string): Promise<IAgent | null> {
    return this.agents.find(a => a.name === name) || null;
  }

  async findAll(): Promise<IAgent[]> {
    return this.agents;
  }
}
