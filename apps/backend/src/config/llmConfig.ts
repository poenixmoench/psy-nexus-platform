export const LLM_MODELS = {
  LLAMA_3_70B: 'Llama-3-70B',
  MIXTRAL_8X22B: 'Mixtral-8x22B',
  QWEN_2_5_CODER_14B: 'Qwen2.5-Coder-14B',
} as const;

export const AGENT_MODEL_MAPPING = {
  'Nexus Koordinator': LLM_MODELS.LLAMA_3_70B,
  'Qwen2.5 Coder': LLM_MODELS.QWEN_2_5_CODER_14B,
  'Performance Tuner': LLM_MODELS.LLAMA_3_70B,
  'UI Magier': LLM_MODELS.MIXTRAL_8X22B,
  'Debugger Fuchs': LLM_MODELS.LLAMA_3_70B,
  'Data Archivist': LLM_MODELS.MIXTRAL_8X22B,
} as const;
