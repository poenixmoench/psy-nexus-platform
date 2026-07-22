export const AGENT_CONFIGS = {
  'ORION_AGENT': { model: 'qwen3:32b', temperature: 0.6, num_ctx: 16384 },
  'PLAN_AGENT': { model: 'qwen3:32b', temperature: 0.5, num_ctx: 16384 },
  'BACKEND_ARCHITEKT_AGENT': { model: 'qwen3:32b', temperature: 0.4, num_ctx: 16384 },
  'QA_GURU_AGENT': { model: 'qwen3:32b', temperature: 0.3, num_ctx: 8192 },
  'DESIGN_ALCHEMIST_AGENT': { model: 'qwen3:latest', temperature: 0.7, num_ctx: 8192 },
  'FRONTEND_MEISTER_AGENT': { model: 'qwen3:latest', temperature: 0.5, num_ctx: 8192 },
  'OPTIMIERER_AGENT': { model: 'qwen3:latest', temperature: 0.3, num_ctx: 8192 },
  'DOKUMENTATION_AGENT': { model: 'qwen3:latest', temperature: 0.6, num_ctx: 16384 }
};
export const getAgentConfig = (name: string) => (AGENT_CONFIGS as any)[name] || AGENT_CONFIGS['ORION_AGENT'];
