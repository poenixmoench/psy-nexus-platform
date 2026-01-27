export const llmConfig = {
  baseUrl: "http://localhost:11434",
  models: {
    coding: "qwen2.5-coder:14b",
    communication: "qwen2.5:14b"
  },
  agentMapping: {
    OrionAgent: "communication",
    DialogAgent: "communication",
    PlanAgent: "communication",
    DokumentationAgent: "communication",
    
    BackendArchitectAgent: "coding",
    FrontendMeisterAgent: "coding",
    OptimizerAgent: "coding",
    DesignAlchemistAgent: "coding", 
    QaGuruAgent: "coding"
  }
};

// Alias für Abwärtskompatibilität mit alten Typ-Dateien
export const LLM_MODELS = {
  CODING: "qwen2.5-coder:14b",
  CHAT: "qwen2.5:14b"
};
