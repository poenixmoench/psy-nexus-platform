import axios from 'axios';
export class AiOrchestratorService {
    constructor() {
        this.ollamaUrl = process.env.OLLAMA_URL || 'http://ollama:11434';
    }
    async orchestrate(data) {
        try {
            const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
                model: 'qwen:7b',
                prompt: data.prompt || 'Hello',
                stream: false,
            });
            return { success: true, response: response.data };
        }
        catch (error) {
            throw new Error('Orchestration failed: ' + error.message);
        }
    }
}
//# sourceMappingURL=AiOrchestratorService.js.map