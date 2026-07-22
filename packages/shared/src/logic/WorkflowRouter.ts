import { KnownAgentType } from '../types/AgentTypes';

export interface WorkflowStep {
  agent: KnownAgentType;
  requiresApproval: boolean;
  gateName?: string;
}

export class WorkflowRouter {
  // Diese Map könnte später aus einer JSON geladen werden
  private static readonly sequence: Record<string, WorkflowStep> = {
    'initial_orion': { agent: 'PLAN_AGENT', requiresApproval: false },
    'planning':      { agent: 'DESIGN_ALCHEMIST_AGENT', requiresApproval: true, gateName: 'PLAN_APPROVAL' },
    'design':        { agent: 'FRONTEND_MEISTER_AGENT', requiresApproval: true, gateName: 'DESIGN_APPROVAL' },
    'frontend':      { agent: 'BACKEND_ARCHITEKT_AGENT', requiresApproval: false },
    'backend':       { agent: 'QA_GURU_AGENT', requiresApproval: false },
    'qa':            { agent: 'OPTIMIERER_AGENT', requiresApproval: true, gateName: 'QA_APPROVAL' },
    'optimization':  { agent: 'DOKUMENTATION_AGENT', requiresApproval: false },
    'documentation': { agent: 'ORION_AGENT', requiresApproval: true, gateName: 'DOC_APPROVAL' },
    'final_orion':   { agent: 'ORION_AGENT', requiresApproval: true, gateName: 'FINAL_MISSION_CONTROL' }
  };

  static getStep(stepId: string): WorkflowStep | null {
    return this.sequence[stepId] || null;
  }

  static getNextAgent(currentStep: string): KnownAgentType | null {
    const step = this.sequence[currentStep];
    return step ? step.agent : null;
  }

  static requiresApproval(currentStep: string): boolean {
    const step = this.sequence[currentStep];
    return step ? step.requiresApproval : false;
  }

  static getApprovalGate(currentStep: string): string | null {
    const step = this.sequence[currentStep];
    return step && step.gateName ? step.gateName : null;
  }

  static isValidAgent(agentName: string): agentName is KnownAgentType {
    const validAgents = [
      'ORION_AGENT', 'PLAN_AGENT', 'DESIGN_ALCHEMIST_AGENT', 
      'FRONTEND_MEISTER_AGENT', 'BACKEND_ARCHITEKT_AGENT', 
      'QA_GURU_AGENT', 'OPTIMIERER_AGENT', 'DOKUMENTATION_AGENT'
    ];
    return validAgents.includes(agentName);
  }
}
