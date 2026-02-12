"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaAdapter = void 0;
const tsyringe_1 = require("tsyringe");
const ContextManager_1 = require("@shared/logic/ContextManager");
const axios_1 = __importDefault(require("axios"));
let OllamaAdapter = class OllamaAdapter {
    constructor() {
        this.OLLAMA_BASE_URL = 'http://localhost:11434';
        this.STRATEGIC_RESERVE = 'qwen2.5:14b';
        this.WORKBENCH = 'qwen2.5-coder:14b';
        this.ollamaOnline = false;
        this.lastHealthCheck = 0;
    }
    async checkHealth() {
        const NOW = Date.now();
        if (this.ollamaOnline && (NOW - this.lastHealthCheck) < 30000)
            return true;
        try {
            await axios_1.default.get(`${this.OLLAMA_BASE_URL}/api/tags`, { timeout: 2000 });
            this.ollamaOnline = true;
            this.lastHealthCheck = NOW;
            return true;
        }
        catch (e) {
            this.ollamaOnline = false;
            return false;
        }
    }
    getModel(agentName) {
        const strategyAgents = ['ORION_AGENT', 'PLAN_AGENT', 'QA_GURU_AGENT', 'DOKUMENTATION_AGENT'];
        return strategyAgents.includes(agentName) ? this.STRATEGIC_RESERVE : this.WORKBENCH;
    }
    async askAgent(agentName, task, history, retries = 2) {
        if (!await this.checkHealth()) {
            throw new Error(`[OllamaAdapter] Ollama Service ist OFFLINE oder nicht erreichbar.`);
        }
        const model = this.getModel(agentName);
        const relevantContext = ContextManager_1.ContextManager.calculateDelta(history, agentName);
        const contextString = relevantContext
            .map(t => `[${new Date(t.timestamp).toISOString()}] ${t.sourceAgent}: ${JSON.stringify(t.payload.data)}`)
            .join('\n');
        const prompt = `
      SYSTEM: Du agierst als ${agentName}. Antworte NUR in JSON.
      KONTEXT:
      ${contextString}
      AUFGABE:
      ${task}
    `;
        const startTime = Date.now();
        try {
            const response = await axios_1.default.post(`${this.OLLAMA_BASE_URL}/api/generate`, {
                model: model,
                prompt: prompt,
                stream: false,
                format: 'json',
                options: { temperature: 0.2, num_ctx: 8192 }
            }, { timeout: 45000 }); // 45 Sekunden für 14B Inference
            const duration = Date.now() - startTime;
            console.log(`[OllamaAdapter] ${agentName} -> ${model} (${duration}ms)`);
            return JSON.parse(response.data.response);
        }
        catch (error) {
            if (retries > 0) {
                console.warn(`[OllamaAdapter] Fehler bei ${agentName}, versuche erneut... (${retries} verbleibend)`);
                return this.askAgent(agentName, task, history, retries - 1);
            }
            throw error;
        }
    }
};
exports.OllamaAdapter = OllamaAdapter;
exports.OllamaAdapter = OllamaAdapter = __decorate([
    (0, tsyringe_1.singleton)(),
    (0, tsyringe_1.injectable)()
], OllamaAdapter);
