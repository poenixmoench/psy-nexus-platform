"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowRouter = void 0;
class WorkflowRouter {
    static getStep(stepId) {
        return this.sequence[stepId] || null;
    }
    static getNextAgent(currentStep) {
        const step = this.sequence[currentStep];
        return step ? step.agent : null;
    }
    static requiresApproval(currentStep) {
        const step = this.sequence[currentStep];
        return step ? step.requiresApproval : false;
    }
    static getApprovalGate(currentStep) {
        const step = this.sequence[currentStep];
        return step && step.gateName ? step.gateName : null;
    }
    static isValidAgent(agentName) {
        const validAgents = [
            'ORION_AGENT', 'PLAN_AGENT', 'DESIGN_ALCHEMIST_AGENT',
            'FRONTEND_MEISTER_AGENT', 'BACKEND_ARCHITEKT_AGENT',
            'QA_GURU_AGENT', 'OPTIMIERER_AGENT', 'DOKUMENTATION_AGENT'
        ];
        return validAgents.includes(agentName);
    }
}
exports.WorkflowRouter = WorkflowRouter;
// Diese Map könnte später aus einer JSON geladen werden
WorkflowRouter.sequence = {
    'initial_orion': { agent: 'PLAN_AGENT', requiresApproval: false },
    'planning': { agent: 'DESIGN_ALCHEMIST_AGENT', requiresApproval: true, gateName: 'PLAN_APPROVAL' },
    'design': { agent: 'FRONTEND_MEISTER_AGENT', requiresApproval: true, gateName: 'DESIGN_APPROVAL' },
    'frontend': { agent: 'BACKEND_ARCHITEKT_AGENT', requiresApproval: false },
    'backend': { agent: 'QA_GURU_AGENT', requiresApproval: false },
    'qa': { agent: 'OPTIMIERER_AGENT', requiresApproval: true, gateName: 'QA_APPROVAL' },
    'optimization': { agent: 'DOKUMENTATION_AGENT', requiresApproval: false },
    'documentation': { agent: 'ORION_AGENT', requiresApproval: true, gateName: 'DOC_APPROVAL' },
    'final_orion': { agent: 'ORION_AGENT', requiresApproval: true, gateName: 'FINAL_MISSION_CONTROL' }
};
