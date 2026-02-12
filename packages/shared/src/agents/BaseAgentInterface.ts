import { ContextDelta, StigmergyTag, KnownAgentType } from '../types/AgentTypes';

export interface IBaseAgent {
  readonly name: KnownAgentType;
  processDelta(delta: ContextDelta): Promise<{
    text: string;
    newTags: StigmergyTag[];
  }>;
}
