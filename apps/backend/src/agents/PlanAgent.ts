import { BaseAgent, AgentResponse } from './BaseAgent';

export class PlanAgent extends BaseAgent {
  name = "PLAN-AGENT";

  async process(input: string): Promise<AgentResponse> {
    return {
      agentName: this.name,
      phase: 2,
      content: "Technischer Schlachtplan erstellt:\n1. Tech-Stack: Vue3 + Node.js\n2. Komponenten: Hero, Cards, Footer\n3. API-Endpunkte: /auth, /projects",
      metadata: { validated: true }
    };
  }
}
