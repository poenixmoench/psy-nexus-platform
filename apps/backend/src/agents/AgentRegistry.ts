import { OrionAgent } from './OrionAgent';
import { PlanAgent } from './PlanAgent';
import { DesignAlchemistAgent } from './DesignAlchemistAgent';
import { FrontendMeisterAgent } from './FrontendMeisterAgent';
import { BackendArchitectAgent } from './BackendArchitectAgent';
import { QaGuruAgent } from './QaGuruAgent';
import { OptimizerAgent } from './OptimizerAgent';
import { DokumentationAgent } from './DokumentationAgent';
// import { DialogAgent } from './DialogAgent'; // Entfernt

/**
 * ZENTRALE AGENTEN-MAP (Intern)
 * Dies ist die einzige Stelle, an der neue Agenten hinzugefügt werden müssen.
 */
export const AGENT_MAP = {
  OrionAgent,
  PlanAgent,
  DesignAlchemistAgent,
  FrontendMeisterAgent,
  BackendArchitectAgent,
  QaGuruAgent,
  OptimizerAgent,
  DokumentationAgent
  // DialogAgent // Entfernt
} as const;

/**
 * DYNAMISCHE ABLEITUNGEN
 * Verhindert Redundanz zwischen Map und Array.
 */
export const AGENT_CLASSES = Object.values(AGENT_MAP);

export type RegisteredAgentName = keyof typeof AGENT_MAP;

/**
 * MAPPING (Öffentlich zu Intern)
 * Verbindet die Namen, wie sie z.B. in llmConfig.ts oder vom Frontend genutzt werden,
 * mit den internen Klassennamen, unter denen sie im DI-Container registriert sind.
 * Dies ist eine zentrale Stelle für die Namensauflösung.
 * TODO: Stelle sicher, dass alle verwendeten öffentlichen Namen hier aufgeführt sind.
 */
export const PUBLIC_TO_INTERNAL_NAME_MAP: Record<string, RegisteredAgentName> = {
  'ORION': 'OrionAgent',
  'PLAN-AGENT': 'PlanAgent',
  'DESIGN-ALCHEMIST': 'DesignAlchemistAgent',
  'FRONTEND-MEISTER': 'FrontendMeisterAgent',
  'BACKEND-ARCHITEKT': 'BackendArchitectAgent',
  'QA-GURU': 'QaGuruAgent',
  'OPTIMIERER': 'OptimizerAgent',
  'DOKUMENTATION-AGENT': 'DokumentationAgent'
  // 'DIALOG-AGENT': 'DialogAgent', // Entfernt
  // Füge weitere hinzu, wenn nötig
};

/**
 * VALIDIERUNG (Intern)
 */
export const isValidAgentName = (name: string): name is RegisteredAgentName => {
  return name in AGENT_MAP;
};

/**
 * MAPPING-FUNKTION (Öffentlich zu Intern)
 * Diese Funktion wandelt einen möglichen öffentlichen Namen in den internen Klassennamen um.
 * Falls kein Mapping gefunden wird, wird der Eingabename zurückgegeben (für den Fall, dass
 * bereits der interne Name übergeben wird oder ein Standardfall vorliegt).
 */
export const mapToInternalName = (publicName: string): RegisteredAgentName | string => {
  // Konvertiere den Eingabenamen in Großbuchstaben, um die Suche zu vereinheitlichen
  const upperCasePublicName = publicName.toUpperCase();
  return PUBLIC_TO_INTERNAL_NAME_MAP[upperCasePublicName] || publicName;
};

export const getAvailableAgentNames = (): string => Object.keys(AGENT_MAP).join(', ');
