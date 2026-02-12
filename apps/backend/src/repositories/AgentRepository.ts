import { IAgent } from '../types/Agent';

export class AgentRepository {
  private agents: IAgent[] = [
    {
      id: 'master-agent-1',
      name: 'Nexus Koordinator',
      role: 'Master Orchestrator',
      description: 'Koordiniert 7-Agenten Workflow'
    } as any
  ];

  async getAgentByName(name: string): Promise<IAgent | null> {
    return this.agents.find(a => a.name === name) || null;
  }

  async findAll(): Promise<IAgent[]> {
    return this.agents;
  }

  async findById(id: string): Promise<IAgent | null> {
    return this.agents.find(a => a.id === id) || null;
  }

  async create(data: IAgent): Promise<IAgent> {
    this.agents.push(data);
    return data;
  }

  async update(id: string, data: any): Promise<IAgent | null> {
    const index = this.agents.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.agents[index] = { ...this.agents[index], ...data };
    return this.agents[index];
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.agents.length;
    this.agents = this.agents.filter(a => a.id !== id);
    return this.agents.length < initialLength;
  }
}
