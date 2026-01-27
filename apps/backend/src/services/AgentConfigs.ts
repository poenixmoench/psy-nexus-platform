import { ORION_PROMPT } from '../config/prompts/orion.prompt';
import { DESIGN_PROMPT } from '../config/prompts/design.prompt';
import { FRONTEND_PROMPT } from '../config/prompts/frontend.prompt';
import { DOKUMENTATION_PROMPT } from '../config/prompts/dokumentation.prompt';
import { PLAN_PROMPT } from '../config/prompts/plan.prompt';
import { BACKEND_PROMPT } from '../config/prompts/backend.prompt';
import { QA_PROMPT } from '../config/prompts/qa.prompt';
import { OPTIMIZER_PROMPT } from '../config/prompts/optimizer.prompt';

export const AGENT_CONFIGS = {
  "OrionAgent": { name: "Orion", model: "qwen2.5:14b", systemPrompt: ORION_PROMPT, temperature: 0.7 },
  'ORION': { name: 'ORION', model: 'qwen2.5:14b', systemPrompt: ORION_PROMPT, temperature: 0.7 },
  'PLAN-AGENT': { name: 'PLAN-AGENT', model: 'qwen2.5:14b', systemPrompt: PLAN_PROMPT, temperature: 0.5 },
  'FRONTEND-MEISTER': { name: 'FRONTEND-MEISTER', model: 'qwen2.5-coder:14b', systemPrompt: FRONTEND_PROMPT, temperature: 0.2 },
  'DESIGN-ALCHEMIST': { name: 'DESIGN-ALCHEMIST', model: 'qwen2.5-coder:14b', systemPrompt: DESIGN_PROMPT, temperature: 0.3 },
  'BACKEND-ARCHITEKT': { name: 'BACKEND-ARCHITEKT', model: 'qwen2.5:14b', systemPrompt: BACKEND_PROMPT, temperature: 0.5 },
  'QA-GURU': { name: 'QA-GURU', model: 'qwen2.5-coder:14b', systemPrompt: QA_PROMPT, temperature: 0.4 },
  'OPTIMIERER': { name: 'OPTIMIERER', model: 'qwen2.5-coder:14b', systemPrompt: OPTIMIZER_PROMPT, temperature: 0.3 },
  'DOKUMENTATION-AGENT': { name: 'DOKUMENTATION-AGENT', model: 'qwen2.5:14b', systemPrompt: DOKUMENTATION_PROMPT, temperature: 0.6 }
};

export const getAgentConfig = (name: string) => (AGENT_CONFIGS as any)[name] || AGENT_CONFIGS['ORION'];
