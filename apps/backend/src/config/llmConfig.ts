export const llmConfig = {
  baseUrl: "http://localhost:11434",
  models: {
    coding: "qwen3:32b",
    communication: "qwen3:32b"
  },
  agentMapping: {
    OrionAgent: "communication",
    DialogAgent: "communication",
    PlanAgent: "communication",
    DokumentationAgent: "coding",
    
    BackendArchitectAgent: "coding",
    FrontendMeisterAgent: "coding",
    OptimizerAgent: "coding",
    DesignAlchemistAgent: "coding", 
    QaGuruAgent: "coding"
  }
};

// Alias für Abwärtskompatibilität mit alten Typ-Dateien
export const LLM_MODELS = {
  CODING: "qwen3:32b",
  CHAT: "qwen3:32b"
};
