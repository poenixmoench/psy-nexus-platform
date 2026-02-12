"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StafettenManager = void 0;
const tsyringe_1 = require("tsyringe");
var KnownAgents;
(function (KnownAgents) {
    KnownAgents["FRONTEND_MEISTER"] = "FrontendMeisterAgent";
    KnownAgents["DESIGN_ALCHEMIST"] = "DesignAlchemistAgent";
    KnownAgents["PLAN_AGENT"] = "PlanAgent";
    KnownAgents["DOKUMENTATION_AGENT"] = "DokumentationAgent";
    KnownAgents["ORION_AGENT"] = "OrionAgent";
    KnownAgents["BACKEND_ARCHITEKT"] = "BackendArchitectAgent";
    KnownAgents["QA_GURU"] = "QaGuruAgent";
    KnownAgents["OPTIMIERER"] = "OptimizerAgent";
})(KnownAgents || (KnownAgents = {}));
const KEYWORD_TO_AGENT_MAPPING = [
    { keywords: ['frontend', 'ui', 'ux', 'interface', 'vue', 'button', 'component'], agent: KnownAgents.FRONTEND_MEISTER },
    { keywords: ['design', 'visual', 'layout', 'color', 'style', 'css'], agent: KnownAgents.DESIGN_ALCHEMIST },
    { keywords: ['plan', 'strategy', 'coordinate', 'organize', 'roadmap'], agent: KnownAgents.PLAN_AGENT },
    { keywords: ['documentation', 'document', 'spec', 'info', 'readme', 'json-ld'], agent: KnownAgents.DOKUMENTATION_AGENT },
    { keywords: ['archive', 'final', 'done', 'orion', 'save', 'bibliothek'], agent: KnownAgents.ORION_AGENT },
    { keywords: ['backend', 'server', 'api', 'database', 'node', 'express'], agent: KnownAgents.BACKEND_ARCHITEKT },
    { keywords: ['quality', 'test', 'check', 'qa', 'bug', 'fix'], agent: KnownAgents.QA_GURU },
    { keywords: ['optimize', 'performance', 'speed', 'optimizer', 'refactor'], agent: KnownAgents.OPTIMIERER },
];
let StafettenManager = class StafettenManager {
    async checkForPriorityHandover(response, currentAgent, targetAgent) {
        const responseLower = response.toLowerCase().trim();
        if (targetAgent && responseLower.includes(targetAgent.toLowerCase())) {
            return { needsHandover: true, suggestedAgents: [targetAgent], priority: 10 };
        }
        const suggestedAgentsSet = new Set();
        for (const mapping of KEYWORD_TO_AGENT_MAPPING) {
            if (mapping.keywords.some(keyword => responseLower.includes(keyword))) {
                suggestedAgentsSet.add(mapping.agent);
            }
        }
        const filteredSuggestions = Array.from(suggestedAgentsSet).filter(agent => agent.toLowerCase() !== currentAgent.toLowerCase());
        return {
            needsHandover: filteredSuggestions.length > 0,
            suggestedAgents: filteredSuggestions,
            priority: filteredSuggestions.length > 0 ? 5 : 0
        };
    }
};
exports.StafettenManager = StafettenManager;
exports.StafettenManager = StafettenManager = __decorate([
    (0, tsyringe_1.injectable)()
], StafettenManager);
