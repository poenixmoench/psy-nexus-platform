import { container } from 'tsyringe';
import { BaseAgent } from '@shared/basis-agent/BaseAgent';
import { OrionAgent } from './OrionAgent';
import { PlanAgent } from './PlanAgent';
import { DesignAlchemistAgent } from './DesignAlchemistAgent';
import { FrontendMeisterAgent } from './FrontendMeisterAgent';
import { BackendArchitektAgent } from './BackendArchitektAgent';
import { QAGuruAgent } from './QAGuruAgent';
import { OptimiererAgent } from './OptimiererAgent';
import { DokumentationAgent } from './DokumentationAgent';

export { BaseAgent };

export const AGENT_MAP: Record<string, any> = {
  'ORION_AGENT': OrionAgent,
  'PLAN_AGENT': PlanAgent,
  'DESIGN_ALCHEMIST_AGENT': DesignAlchemistAgent,
  'FRONTEND_MEISTER_AGENT': FrontendMeisterAgent,
  'BACKEND_ARCHITEKT_AGENT': BackendArchitektAgent,
  'QA_GURU_AGENT': QAGuruAgent,
  'OPTIMIERER_AGENT': OptimiererAgent,
  'DOKUMENTATION_AGENT': DokumentationAgent
};

export const KNOWN_AGENTS_SET = new Set(Object.keys(AGENT_MAP));

export function mapToInternalType(name: string): any { 
  return name; 
}

export function registerAllAgents() {
  container.register('ORION_AGENT', { useClass: OrionAgent });
  container.register('PLAN_AGENT', { useClass: PlanAgent });
  container.register('DESIGN_ALCHEMIST_AGENT', { useClass: DesignAlchemistAgent });
  container.register('FRONTEND_MEISTER_AGENT', { useClass: FrontendMeisterAgent });
  container.register('BACKEND_ARCHITEKT_AGENT', { useClass: BackendArchitektAgent });
  container.register('QA_GURU_AGENT', { useClass: QAGuruAgent });
  container.register('OPTIMIERER_AGENT', { useClass: OptimiererAgent });
  container.register('DOKUMENTATION_AGENT', { useClass: DokumentationAgent });
  console.log('✅ [REGISTRY] Alle 8 Agenten im Container versiegelt.');
}
