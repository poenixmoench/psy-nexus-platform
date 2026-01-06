import axios from 'axios';

const MODEL_FOR_AGENT: Record<string, string> = {
  'ORION': 'qwen2.5:14b',
  'PLAN-AGENT': 'qwen2.5:14b',
  'FRONTEND-MEISTER': 'qwen2.5-coder:14b',
  'DESIGN-ALCHEMIST': 'qwen2.5-coder:14b',
  'BACKEND-ARCHITEKT': 'qwen2.5-coder:14b',
  'QA-GURU': 'qwen2.5-coder:14b',
  'OPTIMIERER': 'qwen2.5-coder:14b',
  'DOKUMENTATION-AGENT': 'qwen2.5:14b'
};

const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';

export async function askAI(prompt: string, agentName?: string): Promise<string> {
  const model = agentName ? MODEL_FOR_AGENT[agentName] || 'qwen2.5-coder:14b' : 'qwen2.5-coder:14b';
  console.log(`[AI] Agent: ${agentName || 'DEFAULT'}, Model: ${model}`);

  const response = await axios.post(OLLAMA_URL, {
    model,
    prompt,
    stream: false,
  }, { 
    timeout: 300000
  });
  
  return response.data.response;
}

export async function askAIStream(
  prompt: string,
  onChunk: (chunk: string) => void,
  agentName?: string
): Promise<string> {
  const model = agentName ? MODEL_FOR_AGENT[agentName] || 'qwen2.5-coder:14b' : 'qwen2.5-coder:14b';
  console.log(`[STREAM-START] Agent: ${agentName || 'DEFAULT'}, Model: ${model}`);

  return new Promise((resolve, reject) => {
    axios.post(OLLAMA_URL, {
      model,
      prompt,
      stream: true,
    }, {
      responseType: 'stream',
      timeout: 300000,
      maxRedirects: 0
    }).then((response) => {
      console.log(`[STREAM-GOT-RESPONSE] Status: ${response.status}`);
      let fullText = "";
      let buffer = "";
      let chunkCount = 0;

      response.data.on('data', (chunk: Buffer) => {
        chunkCount++;
        console.log(`[DATA-${chunkCount}] ${chunk.length} bytes`);
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            if (json.response) {
              fullText += json.response;
              console.log(`[CHUNK] ${json.response.length} chars, Total: ${fullText.length}`);
              onChunk(json.response);
            }
            if (json.done) {
              console.log(`[DONE FLAG] Received after ${chunkCount} data events`);
            }
          } catch (e: any) {
            console.error(`[PARSE ERROR]`, e?.message || String(e));
          }
        }
      });

      response.data.on('error', (err: Error) => {
        console.error(`[STREAM ERROR]`, err.message);
        reject(err);
      });

      response.data.on('end', () => {
        console.log(`[STREAM-END] Total: ${fullText.length} chars, ${chunkCount} data events`);
        resolve(fullText);
      });

      response.data.on('close', () => {
        console.log(`[STREAM-CLOSED]`);
      });
    }).catch((err: any) => {
      console.error(`[AXIOS ERROR]`, err?.message || String(err));
      reject(err);
    });
  });
}
