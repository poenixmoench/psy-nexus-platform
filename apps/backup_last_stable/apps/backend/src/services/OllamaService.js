"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaService = void 0;
const axios_1 = __importDefault(require("axios"));
const AgentConfigs_1 = require("./AgentConfigs");
const OLLAMA_API = 'http://127.0.0.1:11434/api/generate';
class OllamaService {
    static async generateStream(userMessage, agentName, onChunk) {
        const config = AgentConfigs_1.AGENT_CONFIGS[agentName] || AgentConfigs_1.AGENT_CONFIGS['ORION'];
        console.log(`🤖 DISPATCH: ${agentName} nutzt Modell ${config.model}`);
        try {
            const response = await axios_1.default.post(OLLAMA_API, {
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
                response.data.on('data', (chunk) => {
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
                    }
                    catch (err) { }
                });
                response.data.on('end', () => resolve(fullText));
                response.data.on('error', (err) => reject(err));
            });
        }
        catch (err) {
            throw err;
        }
    }
}
exports.OllamaService = OllamaService;
