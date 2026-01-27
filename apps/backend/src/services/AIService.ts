import axios from 'axios';
import { getAgentConfig } from './AgentConfigs';

const OLLAMA_URL = 'http://127.0.0.1:11434/api/chat';

export async function askAIStream(
  prompt: string,
  onChunk: (chunk: string) => void,
  agentName: string = 'ORION'
): Promise<string> {
  const config = getAgentConfig(agentName);
  
  return new Promise((resolve, reject) => {
    axios.post(OLLAMA_URL, {
      model: config.model,
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: prompt }
      ],
      stream: true,
      options: { 
        temperature: config.temperature,
        stop: [">>>", "■", "User:"] 
      }
    }, {
      responseType: 'stream',
      timeout: 600000
    }).then((response) => {
      let fullText = "";
      let buffer = "";

      response.data.on('data', (chunk: Buffer) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              const content = json.message.content;
              fullText += content;
              onChunk(content);
            }
            if (json.done) {
              // Sofort resolve bei json.done
              resolve(fullText.trim());
            }
          } catch (e) {}
        }
      });

      response.data.on('end', () => {
        resolve(fullText.trim());
      });
    }).catch(reject);
  });
}

export async function askAI(prompt: string, agentName: string = 'ORION'): Promise<string> {
  const config = getAgentConfig(agentName);
  const res = await axios.post(OLLAMA_URL, {
    model: config.model,
    messages: [{ role: 'system', content: config.systemPrompt }, { role: 'user', content: prompt }],
    stream: false
  });
  return res.data.message.content;
}
