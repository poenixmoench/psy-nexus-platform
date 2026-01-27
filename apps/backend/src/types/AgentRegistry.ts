import { AgentInput, AgentResult } from './AgentExecutor';

export interface BaseAgent {
  execute(input: AgentInput): Promise<AgentResult>;
  executeStreaming?(input: AgentInput, onChunk: (chunk: string) => void): Promise<AgentResult>;
}
