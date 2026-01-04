import axios from 'axios';

export class AIService {
  private static readonly OLLAMA_URL = 'http://127.0.0.1:11434';
  private static readonly MODEL = 'qwen2.5-coder:14b';

  static async askAI(prompt: string): Promise<string> {
    try {
      console.log("🤖 AIService: Calling Qwen (timeout: 300s)...");

      const response = await axios.post(
        `${this.OLLAMA_URL}/api/generate`,
        {
          model: this.MODEL,
          prompt: prompt,
          stream: false,
          temperature: 0.7,
        },
        {
          timeout: 300000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const result = response.data.response;
      console.log("✅ Qwen Response received:", result.substring(0, 100) + "...");
      return result;
    } catch (error: any) {
      console.error("❌ AIService Error:", error.message);
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.error("   → Ollama not running on 127.0.0.1:11434");
      }
      throw error;
    }
  }
}

export const askAI = AIService.askAI.bind(AIService);
