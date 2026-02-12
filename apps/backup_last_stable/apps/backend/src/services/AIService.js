"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askAIStream = askAIStream;
exports.askAI = askAI;
const axios_1 = __importDefault(require("axios"));
const AgentConfigs_1 = require("./AgentConfigs");
const OLLAMA_URL = 'http://127.0.0.1:11434/api/chat';
async function askAIStream(prompt, onChunk, agentName = 'ORION') {
    const config = (0, AgentConfigs_1.getAgentConfig)(agentName);
    return new Promise((resolve, reject) => {
        axios_1.default.post(OLLAMA_URL, {
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
            response.data.on('data', (chunk) => {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop() || "";
                for (const line of lines) {
                    if (!line.trim())
                        continue;
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
                    }
                    catch (e) { }
                }
            });
            response.data.on('end', () => {
                resolve(fullText.trim());
            });
        }).catch(reject);
    });
}
async function askAI(prompt, agentName = 'ORION') {
    const config = (0, AgentConfigs_1.getAgentConfig)(agentName);
    const res = await axios_1.default.post(OLLAMA_URL, {
        model: config.model,
        messages: [{ role: 'system', content: config.systemPrompt }, { role: 'user', content: prompt }],
        stream: false
    });
    return res.data.message.content;
}
