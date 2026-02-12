import { ContextDelta, StigmergyTag, KnownAgentType } from '../types/AgentTypes';

export { ContextDelta, StigmergyTag, KnownAgentType };

export interface AgentResponse {
  text: string;
  newTags: StigmergyTag[];
  metadata?: Record<string, any>;
}

export interface AgentContract {
  readonly name: KnownAgentType;
  processDelta(delta: ContextDelta): Promise<AgentResponse>;
}
