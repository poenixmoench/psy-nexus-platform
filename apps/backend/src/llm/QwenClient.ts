import { injectable, inject } from "tsyringe";
import { Logger } from "../types/Logger";
import { llmConfig } from "../config/llmConfig";

interface OllamaResponse {
  response: string;
}

@injectable()
export class QwenClient {
  constructor(@inject("Logger") private logger: Logger) {}

  async generateForAgent(agentName: string, prompt: string): Promise<string> {
    const type = (llmConfig.agentMapping as any)[agentName] || "communication";
    const model = (llmConfig.models as any)[type];

    this.logger.info("QwenClient", "generate", `Agent [${agentName}] nutzt spezialisiertes Modell [${model}]`);
    
    try {
      const response = await fetch(`${llmConfig.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false,
          options: { 
            temperature: type === "coding" ? 0.2 : 0.7,
            num_ctx: 8192
          }
        })
      });
      const data = await response.json() as OllamaResponse;
      return data.response;
    } catch (error: any) {
      this.logger.error("QwenClient", "generate", `Fehler für ${agentName}: ${error.message}`);
      return `Error: LLM Request failed for ${agentName}`;
    }
  }
}
