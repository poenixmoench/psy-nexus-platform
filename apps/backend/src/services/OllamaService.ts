import axios from 'axios';
import { AGENT_CONFIGS } from './AgentConfigs';

const OLLAMA_API = 'http://127.0.0.1:11434/api/generate';

export class OllamaService {
  static async generateStream(
    userMessage: string,
    agentName: string,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const config = (AGENT_CONFIGS as any)[agentName] || AGENT_CONFIGS['ORION'];
    
    console.log(`🤖 DISPATCH: ${agentName} nutzt Modell ${config.model}`);

    try {
      const response = await axios.post(OLLAMA_API, {
        model: config.model,
        prompt: userMessage,
        system: config.systemPrompt,
        stream: true,
        options: { 
          temperature: config.temperature,
          stop: ['```\n', '---']
        }
      }, { responseType: 'stream' });

      let fullText = '';
      return new Promise((resolve, reject) => {
        response.data.on('data', (chunk: Buffer) => {
          try {
            const lines = chunk.toString('utf8').split('\n');
            for (const line of lines) {
              if (line.trim()) {
                const json = JSON.parse(line);
                if (json.response) {
                  fullText += json.response;
                  onChunk(json.response);
                }
              }
            }
          } catch (err) {}
        });
        response.data.on('end', () => resolve(fullText));
        response.data.on('error', (err: any) => reject(err));
      });
    } catch (err: any) {
      throw err;
    }
  }
}
