"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QwenClient = void 0;
const tsyringe_1 = require("tsyringe");
const llmConfig_1 = require("../config/llmConfig");
let QwenClient = class QwenClient {
    constructor(logger) {
        this.logger = logger;
    }
    async generateForAgent(agentName, prompt) {
        const type = llmConfig_1.llmConfig.agentMapping[agentName] || "communication";
        const model = llmConfig_1.llmConfig.models[type];
        this.logger.info("QwenClient", "generate", `Agent [${agentName}] nutzt spezialisiertes Modell [${model}]`);
        try {
            const response = await fetch(`${llmConfig_1.llmConfig.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: type === "coding" ? 0.2 : 0.7,
                        num_ctx: 8192
                    }
                })
            });
            const data = await response.json();
            return data.response;
        }
        catch (error) {
            this.logger.error("QwenClient", "generate", `Fehler für ${agentName}: ${error.message}`);
            return `Error: LLM Request failed for ${agentName}`;
        }
    }
};
exports.QwenClient = QwenClient;
exports.QwenClient = QwenClient = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("Logger")),
    __metadata("design:paramtypes", [Object])
], QwenClient);
