import { injectable, singleton } from 'tsyringe';
import { ContextManager } from '@shared/logic/ContextManager';
import { StigmergyTag, KnownAgentType } from '@shared/types/AgentTypes';
import axios from 'axios';

@singleton()
@injectable()
export class OllamaAdapter {
  private readonly OLLAMA_BASE_URL = 'http://localhost:11434';
  private readonly STRATEGIC_RESERVE = 'qwen2.5:14b';
  private readonly WORKBENCH = 'qwen2.5-coder:14b';
  
  private ollamaOnline: boolean = false;
  private lastHealthCheck: number = 0;

  private async checkHealth(): Promise<boolean> {
    const NOW = Date.now();
    if (this.ollamaOnline && (NOW - this.lastHealthCheck) < 30000) return true;

    try {
      await axios.get(`${this.OLLAMA_BASE_URL}/api/tags`, { timeout: 2000 });
      this.ollamaOnline = true;
      this.lastHealthCheck = NOW;
      return true;
    } catch (e) {
      this.ollamaOnline = false;
      return false;
    }
  }

  private getModel(agentName: KnownAgentType): string {
    const strategyAgents: KnownAgentType[] = ['ORION_AGENT', 'PLAN_AGENT', 'QA_GURU_AGENT', 'DOKUMENTATION_AGENT'];
    return strategyAgents.includes(agentName) ? this.STRATEGIC_RESERVE : this.WORKBENCH;
  }

  async askAgent(agentName: KnownAgentType, task: string, history: StigmergyTag[], retries = 2): Promise<any> {
    if (!await this.checkHealth()) {
      throw new Error(`[OllamaAdapter] Ollama Service ist OFFLINE oder nicht erreichbar.`);
    }

    const model = this.getModel(agentName);
    const relevantContext = ContextManager.calculateDelta(history, agentName);
    
    const contextString = relevantContext
      .map(t => `[${new Date(t.timestamp).toISOString()}] ${t.sourceAgent}: ${JSON.stringify(t.payload.data)}`)
      .join('\n');

    const prompt = `
      SYSTEM: Du agierst als ${agentName}. Antworte NUR in JSON.
      KONTEXT:
      ${contextString}
      AUFGABE:
      ${task}
    `;

    const startTime = Date.now();

    try {
      const response = await axios.post(`${this.OLLAMA_BASE_URL}/api/generate`, {
        model: model,
        prompt: prompt,
        stream: false,
        format: 'json',
        options: { temperature: 0.2, num_ctx: 8192 }
      }, { timeout: 45000 }); // 45 Sekunden für 14B Inference

      const duration = Date.now() - startTime;
      console.log(`[OllamaAdapter] ${agentName} -> ${model} (${duration}ms)`);
      
      return JSON.parse(response.data.response);
    } catch (error: any) {
      if (retries > 0) {
        console.warn(`[OllamaAdapter] Fehler bei ${agentName}, versuche erneut... (${retries} verbleibend)`);
        return this.askAgent(agentName, task, history, retries - 1);
      }
      throw error;
    }
  }
}
