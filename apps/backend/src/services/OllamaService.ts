import axios from 'axios';

const OLLAMA_API = 'http://127.0.0.1:11434/api/generate';

export interface AgentConfig {
  name: string;
  model: string;
  systemPrompt: string;
  temperature?: number;
}

export const AGENT_CONFIGS: { [key: string]: AgentConfig } = {
  ORION: {
    name: 'ORION',
    model: 'ORION:latest',
    systemPrompt: 'Du bist ORION. Antworte prägnant und strukturiert.',
    temperature: 0.7,
  },
  'FRONTEND-MEISTER': {
    name: 'FRONTEND-MEISTER',
    model: 'qwen2.5-coder:14b',
    systemPrompt: `Du bist FRONTEND-MEISTER für HTML/CSS/JavaScript.

KRITISCH - WENN BENUTZER SVG/HTML FRAGT:
1. Schreib SOFORT ein vollständiges HTML-Dokument
2. Nutze: <!DOCTYPE html>, <html>, <head>, <body>
3. Inline <style> für CSS
4. Inline <script> für JavaScript
5. Sende ALLES in einem \`\`\`html Code-Block
6. KEINE Vue-Templates, KEINE Framework-Syntax
7. Beispiel-Format:
\`\`\`html
<!DOCTYPE html>
<html>
<head>
<style>
/* CSS hier */
</style>
</head>
<body>
<svg><!-- SVG hier --></svg>
<script>
// JS hier
</script>
</body>
</html>
\`\`\`

Das ist DEINE Anweisung. Befolge sie IMMER für SVG/HTML Anfragen.`,
    temperature: 0.3,
  },
};

export class OllamaService {
  static async generateStream(
    userMessage: string,
    agentName: string,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const config = AGENT_CONFIGS[agentName] || AGENT_CONFIGS['ORION'];
    console.log(`🤖 [${config.name}] Processing: ${config.model}`);

    try {
      const response = await axios.post(
        OLLAMA_API,
        {
          model: config.model,
          prompt: userMessage,
          system: config.systemPrompt,
          stream: true,
          temperature: config.temperature || 0.7,
        },
        { responseType: 'stream' }
      );

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
          } catch (err) {
            // Skip
          }
        });

        response.data.on('end', () => {
          console.log(`✅ [${config.name}] Done`);
          resolve(fullText);
        });

        response.data.on('error', (err: any) => {
          reject(err);
        });
      });
    } catch (err: any) {
      console.error(`❌ Ollama Error:`, err.message);
      throw err;
    }
  }
}
