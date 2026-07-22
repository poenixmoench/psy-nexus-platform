/**
 * Statisches Mapping der Agent-Namen und ihrer Kernrollen.
 * ACHTUNG: Dies ist ein Shadow-Mapping zur Validierung.
 * Es greift aktuell NICHT in das Live-Routing ein.
 */

export const AGENT_TOKENS = {
  ORION: 'ORION_AGENT',
  PLANNER: 'PLAN_AGENT',
  FRONTEND: 'FRONTEND_MEISTER_AGENT',
  DESIGN: 'DESIGN_ALCHEMIST_AGENT',
  BACKEND: 'BACKEND_ARCHITEKT_AGENT',
  QA: 'QA_GURU_AGENT',
  OPTIMIZER: 'OPTIMIERER_AGENT',
  DOCS: 'DOKUMENTATION_AGENT',
} as const;

export type AgentTokenKey = keyof typeof AGENT_TOKENS;
export type AgentTokenValue = typeof AGENT_TOKENS[AgentTokenKey];

export const AGENT_ROLE_MAP: Record<AgentTokenValue, string> = {
  [AGENT_TOKENS.ORION]: 'Kommunikation, Konzept & Orchestrierung',
  [AGENT_TOKENS.PLANNER]: 'Struktur & Architektur-Planung',
  [AGENT_TOKENS.FRONTEND]: 'React/Vue UI Implementierung',
  [AGENT_TOKENS.DESIGN]: 'CSS, SVG & Visuelle Harmonie',
  [AGENT_TOKENS.BACKEND]: 'API, DB & Infrastruktur',
  [AGENT_TOKENS.QA]: 'Testabdeckung & Qualitätskontrolle',
  [AGENT_TOKENS.OPTIMIZER]: 'Performance & A11y Refactoring',
  [AGENT_TOKENS.DOCS]: 'SEO, JSON-LD, Geo-Daten & Doku',
};
