import { KnownAgentType, AgentInput, AgentResult } from '@shared/types/AgentTypes';

// WICHTIG: Wir exportieren diese Typen hier, damit der Rest des Backends
// sie zentral von dieser Schnittstelle beziehen kann.
export { AgentInput, AgentResult, KnownAgentType };

export interface AgentExecutor {
  execute(agentName: KnownAgentType, input: AgentInput): Promise<AgentResult>;
}
