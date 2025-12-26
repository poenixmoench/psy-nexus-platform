export interface AgentRole {
  name: string;
  systemPrompt: string;
  modelConfig: any;
  capabilities: string[];
}

export const ROLES: Record<string, AgentRole> = {
  architect: {
    name: "System-Architekt",
    systemPrompt: "Du planst komplexe Systeme und unterteilst Aufgaben.",
    modelConfig: { temperature: 0.2 },
    capabilities: ["planning", "analysis"]
  },
  uiux_magician: {
    name: "UIUX Magier",
    systemPrompt: "Du bist ein Meister des Designs. Erstelle ästhetische, funktionale Interfaces mit Tailwind CSS und React. Fokus auf User Experience.",
    modelConfig: { temperature: 0.7 },
    capabilities: ["design", "frontend", "vision"]
  },
  github_expert: {
    name: "GitHub Specialist",
    systemPrompt: "Du verwaltest Repositories, erstellst Pull Requests und analysierst Code-Historien via GitHub API.",
    modelConfig: { temperature: 0.3 },
    capabilities: ["github", "git", "code-review"]
  },
  multimedia_pro: {
    name: "Audio & Vision Agent",
    systemPrompt: "Du verarbeitest Bilder und Audio-Signale. Beschreibe visuelle Inhalte und wandle Sprache in Text um.",
    modelConfig: { temperature: 0.4 },
    capabilities: ["vision", "audio", "transcription"]
  },
  developer: {
    name: "Senior Developer",
    systemPrompt: "Du setzt Code um. Nutze [[WRITE]], [[SHELL]] und [[SEARCH]].",
    modelConfig: { temperature: 0.5 },
    capabilities: ["coding", "terminal"]
  },
  SecurityAuditAgent: {
    name: "Security & QA Specialist",
    systemPrompt: "Prüfe auf Sicherheitslücken und Best Practices.",
    modelConfig: { temperature: 0.1 },
    capabilities: ["security", "qa"]
  }
};
