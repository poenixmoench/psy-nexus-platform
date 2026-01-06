import { ILLMClient } from './ILLMClient';
import { LlamaClient } from './LlamaClient';
import { MixtralClient } from './MixtralClient';
import { QwenClient } from './QwenClient';
import { LLM_MODELS } from '../config/llmConfig';

export class LLMFactory {
  private static clients: Map<string, ILLMClient> = new Map();

  static createClient(modelName: string): ILLMClient {
    // Singleton caching
    if (this.clients.has(modelName)) {
      return this.clients.get(modelName)!;
    }

    let client: ILLMClient;

    switch (modelName) {
      case LLM_MODELS.LLAMA_3_70B:
        client = new LlamaClient();
        break;
      case LLM_MODELS.MIXTRAL_8X22B:
        client = new MixtralClient();
        break;
      case LLM_MODELS.QWEN_2_5_CODER_14B:
        client = new QwenClient();
        break;
      default:
        throw new Error(` [ERR]  Unsupported LLM model: ${modelName}`);
    }

    this.clients.set(modelName, client);
    console.log(` [OK]  LLM Client created: ${modelName}`);
    return client;
  }

  static listAvailableModels(): string[] {
    return Object.values(LLM_MODELS);
  }
}
