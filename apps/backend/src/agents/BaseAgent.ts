export interface AgentResponse {
  agentName: string;
  phase: number;
  content: string;
  code?: string;
  metadata?: any;
}

export abstract class BaseAgent {
  abstract name: string;
  abstract process(input: any): Promise<AgentResponse>;
}
