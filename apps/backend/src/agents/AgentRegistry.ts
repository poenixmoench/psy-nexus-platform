import { InjectionToken } from 'tsyringe';
import { KnownAgentType, KnownAgentTypeValues } from '@shared/types/AgentTypes';
import { BaseAgent } from '@shared/basis-agent';
import { OrionAgent } from './OrionAgent';
import { PlanAgent } from './PlanAgent';
import { DesignAlchemistAgent } from './DesignAlchemistAgent';
import { FrontendMeisterAgent } from './FrontendMeisterAgent';
import { BackendArchitektAgent } from './BackendArchitektAgent';
import { QaGuruAgent } from './QaGuruAgent';
import { OptimiererAgent } from './OptimiererAgent';
import { DokumentationAgent } from './DokumentationAgent';

export { KnownAgentType, BaseAgent }; // DAS hat gefehlt!

export const KNOWN_AGENTS_SET = new Set<string>(KnownAgentTypeValues);

export const AGENT_MAP: Record<KnownAgentType, InjectionToken<BaseAgent>> = {
  'ORION_AGENT': OrionAgent,
  'PLAN_AGENT': PlanAgent,
  'DESIGN_ALCHEMIST_AGENT': DesignAlchemistAgent,
  'FRONTEND_MEISTER_AGENT': FrontendMeisterAgent,
  'BACKEND_ARCHITEKT_AGENT': BackendArchitektAgent,
  'QA_GURU_AGENT': QaGuruAgent,
  'OPTIMIERER_AGENT': OptimiererAgent,
  'DOKUMENTATION_AGENT': DokumentationAgent,
};

export function mapToInternalType(type: string): KnownAgentType {
  if (!KNOWN_AGENTS_SET.has(type)) {
    console.warn(`[REGISTRY] Warnung: Unbekannter Agenten-Typ "${type}". Fallback auf ORION_AGENT.`);
    return 'ORION_AGENT';
  }
  return type as KnownAgentType;
}
