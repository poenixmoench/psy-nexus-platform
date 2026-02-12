export interface IAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  category: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'loading';
}

export interface AgentStrategyResponse {
  agentId: string;
  strategy: string;
  steps: string[];
  timestamp: string;
}

export interface SseEvent {
  type: string;
  data: any;
}
