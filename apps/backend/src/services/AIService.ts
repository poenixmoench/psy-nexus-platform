import axios from 'axios';
import { getAgentConfig } from './AgentConfigs';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';

export class AIService {
  private selectModel(prompt: string, agentName: string): string {
    const config = getAgentConfig(agentName);
    const complexKeywords = ['strategie', 'analyse', 'architektur', 'konzept', 'plan'];
    const isComplex = prompt.length > 500 || complexKeywords.some(k => prompt.toLowerCase().includes(k));
    return (config.requiresReasoning || isComplex) ? config.model : (config.modelFallback || config.model);
  }

  public async askAI(prompt: string, agentName: string = 'ORION_AGENT'): Promise<string> {
    const model = this.selectModel(prompt, agentName);
    const config = getAgentConfig(agentName);
    const messages: any[] = [{ role: 'user', content: prompt }];
    if (config.systemPrompt && config.systemPrompt.trim().length > 0) {
      messages.unshift({ role: 'system', content: config.systemPrompt });
    }
    const options: any = { num_thread: 12 };
    if (config.num_ctx) options.num_ctx = config.num_ctx;
    if (config.temperature !== undefined) options.temperature = config.temperature;
    const res = await axios.post(OLLAMA_URL, { model, messages, stream: false, options }, { timeout: 600000 });
    return res.data.message.content;
  }

  public async askAIStream(prompt: string, onChunk: (chunk: string, model: string) => void, agentName: string = 'ORION_AGENT'): Promise<string> {
    const model = this.selectModel(prompt, agentName);
    const config = getAgentConfig(agentName);
    const messages: any[] = [{ role: 'user', content: prompt }];
    if (config.systemPrompt && config.systemPrompt.trim().length > 0) {
      messages.unshift({ role: 'system', content: config.systemPrompt });
    }
    const options: any = { num_thread: 12 };
    if (config.num_ctx) options.num_ctx = config.num_ctx;
    if (config.temperature !== undefined) options.temperature = config.temperature;
    return new Promise((resolve, reject) => {
      let fullText = '';
      let buffer = '';
      axios.post(OLLAMA_URL, { model, messages, stream: true, options }, { responseType: 'stream', timeout: 600000 })
        .then(res => {
          res.data.on('data', (chunk: Buffer) => {
            buffer += chunk.toString();
            const lines = buffer.split('\\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const parsed = JSON.parse(line);
                const content = parsed.message?.content || '';
                if (content) {
                  fullText += content;
                  onChunk(content, model);
                }
                if (parsed.done) resolve(fullText);
              } catch (e) {}
            }
          });
          res.data.on('end', () => resolve(fullText));
        })
        .catch(err => reject(err));
    });
  }
}
