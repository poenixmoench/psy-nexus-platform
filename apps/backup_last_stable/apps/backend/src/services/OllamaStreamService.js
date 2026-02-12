"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ollamaService = exports.OllamaStreamService = exports.DUMMY_EXPORT = void 0;
exports.DUMMY_EXPORT = true;
const SIGNATURE = '🎬[OLLAMA-STREAM-SERVICE]';
class OllamaStreamService {
    constructor() {
        this.agentModel = process.env.OLLAMA_MODEL || 'qwen2.5:14b';
        this.ollamaApiUrl = process.env.OLLAMA_API_URL || 'http://host.docker.internal:11434';
    }
    async internalStreamChat(prompt, agentName, res, closeStream = true) {
        try {
            console.log(`[${agentName}] Starting: ${prompt.substring(0, 50)}...`);
            res.write(`data: ${JSON.stringify({
                type: 'agent_start',
                agent: agentName,
                message: `${agentName} beginnt...`
            })}\n\n`);
            const chatEndpoint = `${this.ollamaApiUrl}/api/chat`;
            const payload = {
                model: this.agentModel,
                messages: [
                    {
                        role: 'system',
                        content: `Du bist der ${agentName} Agent. Antworte prägnant und fachlich korrekt auf Deutsch.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                stream: true
            };
            const ollamaResponse = await fetch(chatEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!ollamaResponse.ok || !ollamaResponse.body) {
                throw new Error(`Ollama: ${ollamaResponse.statusText}`);
            }
            const reader = ollamaResponse.body.getReader();
            const decoder = new TextDecoder('utf-8');
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                const chunk = decoder.decode(value);
                for (const line of chunk.split('\n').filter(l => l.trim() !== '')) {
                    try {
                        const data = JSON.parse(line);
                        const content = data.message?.content;
                        if (content) {
                            res.write(`data: ${JSON.stringify({ type: 'chunk', content, agent: agentName })}\n\n`);
                        }
                        if (data.done) {
                            console.log(`[${agentName}] Completed`);
                            if (closeStream) {
                                res.write(`data: ${JSON.stringify({ type: 'agent_end', agent: agentName })}\n\n`);
                                res.end();
                            }
                            return;
                        }
                    }
                    catch (e) {
                        console.warn(`[${agentName}] Parse error`);
                    }
                }
            }
            if (closeStream)
                res.end();
        }
        catch (e) {
            console.error(`[${agentName}] Error:`, e.message);
            res.write(`data: ${JSON.stringify({ type: 'error', agent: agentName, message: e.message })}\n\n`);
            if (closeStream)
                res.end();
        }
    }
    async streamAgentChat(prompt, agentName, res) {
        await this.internalStreamChat(prompt, agentName, res, true);
    }
    async chatWithoutEnd(prompt, agentName, res) {
        await this.internalStreamChat(prompt, agentName, res, false);
    }
    async streamOrchestration(userGoal, res) {
        try {
            res.write(`data: ${JSON.stringify({
                type: 'orchestration_start',
                message: 'Multi-Agenten-Orchestrierung startet...',
                goal: userGoal
            })}\n\n`);
            // Schritt 1: Orchestrator erstellt den Plan
            const planPrompt = `Du bist der Orchestrator. Erstelle einen präzisen 2-Schritt-Plan für: "${userGoal}". Antworte im Format:
SCHRITT 1: [erste Aufgabe]
SCHRITT 2: [zweite Aufgabe]`;
            res.write(`data: ${JSON.stringify({
                type: 'stage',
                stage: 1,
                description: 'Orchestrator erstellt Strategie...'
            })}\n\n`);
            await this.chatWithoutEnd(planPrompt, 'Orchestrator', res);
            // Trennlinie zwischen Agenten
            res.write(`data: ${JSON.stringify({
                type: 'stage',
                stage: 2,
                description: 'Backend-Agent implementiert Schritt 1...'
            })}\n\n`);
            // Schritt 2: Backend-Agent führt aus
            const implementationPrompt = `Basierend auf dem Ziel "${userGoal}", implementiere jetzt prägnant das TypeScript Interface und den Controller. Code-Beispiele bevorzugt.`;
            await this.chatWithoutEnd(implementationPrompt, 'Backend-Developer', res);
            // Trennlinie zwischen Agenten
            res.write(`data: ${JSON.stringify({
                type: 'stage',
                stage: 3,
                description: 'Review-Agent prüft Code...'
            })}\n\n`);
            // Schritt 3: Review-Agent
            const reviewPrompt = `Du bist der Code-Reviewer. Gebe eine kurze Qualitätsbewertung für die o.g. Implementierung: Sind Best Practices eingehalten? Verbesserungsvorschläge?`;
            await this.internalStreamChat(reviewPrompt, 'Code-Reviewer', res, true);
        }
        catch (e) {
            console.error('Orchestration Error:', e.message);
            res.write(`data: ${JSON.stringify({ type: 'error', message: e.message })}\n\n`);
            res.end();
        }
    }
    async generateSimpleResponse(prompt) {
        return 'Response: ' + prompt.substring(0, 50);
    }
    async streamPrompt(prompt) {
        return { type: 'response', content: 'Stream' };
    }
}
exports.OllamaStreamService = OllamaStreamService;
exports.ollamaService = new OllamaStreamService();
