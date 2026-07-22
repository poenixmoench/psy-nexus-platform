import { KnownAgentType } from '@shared/types/AgentTypes';

export interface IAgent {
  id: string;
  name: string;
  role: string;
  description?: string;
  category?: string;
  status: string;
  type?: KnownAgentType;
}
