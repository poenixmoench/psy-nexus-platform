import { BaseAgent, AgentResponse } from '../agents/BaseAgent';

interface ProjectState {
  phase: number;
  progress: number;
  history: any[];
  errors: number;
  projectId: string;
}

export class OrionOrchestrator {
  private state: ProjectState;
  private agents: Map<string, BaseAgent> = new Map();
  private maxRetries = 3;

  constructor(projectId: string) {
    this.state = {
      phase: 1,
      progress: 0,
      history: [],
      errors: 0,
      projectId
    };
  }

  public registerAgent(agent: BaseAgent) {
    this.agents.set(agent.name, agent);
  }

  public async handleMessage(rpcRequest: any): Promise<any> {
    const { method, params, id } = rpcRequest;
    if (method !== 'orion-dialogue') {
      return { jsonrpc: "2.0", error: { code: -32601, message: "Method not found" }, id };
    }

    try {
      const userMessage = params.message;
      const response = await this.executePhaseLogic(userMessage);
      return {
        jsonrpc: "2.0",
        result: { ...response, state: this.state },
        id
      };
    } catch (error) {
      return {
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal error during orchestration" },
        id
      };
    }
  }

  private async executePhaseLogic(input: string): Promise<AgentResponse> {
    switch (this.state.phase) {
      case 1: return this.runAgentWithRetry('ORION', input, 2, 10);
      case 2: return this.runAgentWithRetry('PLAN-AGENT', input, 3, 30);
      case 3: return this.runAgentWithRetry('ORION', input, 4, 40);
      case 4: return this.runAgentWithRetry('FRONTEND-MEISTER', input, 5, 55);
      case 5: return this.runAgentWithRetry('DESIGN-ALCHEMIST', input, 7, 70);
      case 7: return this.runAgentWithRetry('QA-GURU', input, 8, 85);
      case 8: return this.runAgentWithRetry('OPTIMIERER', input, 9, 95);
      case 9: return this.runAgentWithRetry('ORION', input, 10, 100);
      case 10: return this.runAgentWithRetry('DEPLOY-MASTER', input, 1, 100);
      default: throw new Error("Invalid Phase");
    }
  }

  private async runAgentWithRetry(agentName: string, input: string, nextPhase: number, nextProgress: number): Promise<AgentResponse> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const agent = this.agents.get(agentName);
        if (!agent) {
          this.updateState(nextPhase, nextProgress);
          return {
            agentName,
            phase: this.state.phase,
            content: `[System] Agent ${agentName} ist noch im Standby. Input: ${input}`
          };
        }
        const result = await agent.process(input);
        this.updateState(nextPhase, nextProgress);
        return result;
      } catch (err) {
        this.state.errors++;
        console.error(`Retry ${attempt} für ${agentName} fehlgeschlagen.`);
      }
    }
    return {
      agentName: 'ORION-RECOVERY',
      phase: this.state.phase,
      content: "Fehler-Recovery: Agent reagiert nicht. Bitte Phase manuell triggern."
    };
  }

  private updateState(phase: number, progress: number) {
    this.state.phase = phase;
    this.state.progress = progress;
  }
}
