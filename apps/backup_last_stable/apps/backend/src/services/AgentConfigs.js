"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgentConfig = exports.AGENT_CONFIGS = void 0;
const orion_prompt_1 = require("../config/prompts/orion.prompt");
const design_prompt_1 = require("../config/prompts/design.prompt");
const frontend_prompt_1 = require("../config/prompts/frontend.prompt");
const dokumentation_prompt_1 = require("../config/prompts/dokumentation.prompt");
const plan_prompt_1 = require("../config/prompts/plan.prompt");
const backend_prompt_1 = require("../config/prompts/backend.prompt");
const qa_prompt_1 = require("../config/prompts/qa.prompt");
const optimizer_prompt_1 = require("../config/prompts/optimizer.prompt");
exports.AGENT_CONFIGS = {
    "OrionAgent": { name: "Orion", model: "qwen2.5:14b", systemPrompt: orion_prompt_1.ORION_PROMPT, temperature: 0.7 },
    'ORION': { name: 'ORION', model: 'qwen2.5:14b', systemPrompt: orion_prompt_1.ORION_PROMPT, temperature: 0.7 },
    'PLAN-AGENT': { name: 'PLAN-AGENT', model: 'qwen2.5:14b', systemPrompt: plan_prompt_1.PLAN_PROMPT, temperature: 0.5 },
    'FRONTEND-MEISTER': { name: 'FRONTEND-MEISTER', model: 'qwen2.5-coder:14b', systemPrompt: frontend_prompt_1.FRONTEND_PROMPT, temperature: 0.2 },
    'DESIGN-ALCHEMIST': { name: 'DESIGN-ALCHEMIST', model: 'qwen2.5-coder:14b', systemPrompt: design_prompt_1.DESIGN_PROMPT, temperature: 0.3 },
    'BACKEND-ARCHITEKT': { name: 'BACKEND-ARCHITEKT', model: 'qwen2.5:14b', systemPrompt: backend_prompt_1.BACKEND_PROMPT, temperature: 0.5 },
    'QA-GURU': { name: 'QA-GURU', model: 'qwen2.5-coder:14b', systemPrompt: qa_prompt_1.QA_PROMPT, temperature: 0.4 },
    'OPTIMIERER': { name: 'OPTIMIERER', model: 'qwen2.5-coder:14b', systemPrompt: optimizer_prompt_1.OPTIMIZER_PROMPT, temperature: 0.3 },
    'DOKUMENTATION-AGENT': { name: 'DOKUMENTATION-AGENT', model: 'qwen2.5:14b', systemPrompt: dokumentation_prompt_1.DOKUMENTATION_PROMPT, temperature: 0.6 }
};
const getAgentConfig = (name) => exports.AGENT_CONFIGS[name] || exports.AGENT_CONFIGS['ORION'];
exports.getAgentConfig = getAgentConfig;
