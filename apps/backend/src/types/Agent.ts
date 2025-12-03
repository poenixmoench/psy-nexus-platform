import { LLM_MODELS } from '../config/llmConfig';

export type LLMModel = typeof LLM_MODELS[keyof typeof LLM_MODELS];

export interface IAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  preferredModel: LLMModel;
}

export interface AgentWithStats extends IAgent {
  tokensUsed?: number;
  responseTime?: number; // ms
  successRate?: number; // 0-100
}
