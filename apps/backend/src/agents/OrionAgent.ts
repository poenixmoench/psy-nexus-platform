import { BaseAgent, AgentResponse } from './BaseAgent';

export class OrionAgent extends BaseAgent {
  name = "ORION";

  async process(input: string): Promise<AgentResponse> {
    // Hier würde später die AI-API (z.B. GPT-4 oder Gemini) aufgerufen
    return {
      agentName: this.name,
      phase: 1,
      content: `Willkommen bei PSY-NEXUS. Ich habe deine Vision aufgenommen: "${input}". Soll ich mit dem Planning (Phase 2) beginnen?`
    };
  }
}
