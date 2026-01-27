import { Logger } from "../types/Logger";
import { AgentInput, AgentResult } from "../types/AgentExecutor";
import { AgentName } from "../types/AgentTypes";
import { OllamaService } from "../services/OllamaService";

export abstract class BaseAgent {
  constructor(
    protected config: any,
    protected logger: Logger
  ) {}

  abstract name: AgentName;

  async execute(input: AgentInput): Promise<AgentResult> {
    const fullText = await OllamaService.generateStream(
      input.query,
      this.name,
      () => {} // Synchroner Modus: Callback tut nichts
    );
    return { success: true, output: fullText, agentName: this.name };
  }

  // Neue Streaming-Methode für alle Agenten
  async executeStreaming(
    input: AgentInput,
    onChunk: (chunk: string) => void
  ): Promise<AgentResult> {
    const fullText = await OllamaService.generateStream(
      input.query,
      this.name,
      onChunk
    );
    return { success: true, output: fullText, agentName: this.name };
  }
}
