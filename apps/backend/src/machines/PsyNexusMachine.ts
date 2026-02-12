import { createMachine, assign } from 'xstate';
import { RunStatus, KnownAgentType } from '@shared/types/AgentTypes';

interface MachineContext {
  currentAgent: KnownAgentType | null;
  currentStep: string;
  status: RunStatus;
  approvalData?: any;
  error?: string;
}

type MachineEvent =
  | { type: 'START_WORKFLOW'; input: any }
  | { type: 'AGENT_COMPLETED'; agent: KnownAgentType; output: any }
  | { type: 'REQUIRE_APPROVAL'; gate: string; data: any }
  | { type: 'APPROVE_GATE'; gate: string }
  | { type: 'REJECT_GATE'; gate: string; reason: string }
  | { type: 'WORKFLOW_ERROR'; code: string; message: string };

export const psyNexusMachine = createMachine({
  types: {} as {
    context: MachineContext;
    events: MachineEvent;
  },
  id: 'psyNexusOrchestrator',
  initial: 'idle',
  context: {
    currentAgent: null,
    currentStep: '',
    status: { type: 'PENDING' },
    approvalData: undefined,
    error: undefined
  },
  states: {
    idle: {
      on: {
        START_WORKFLOW: {
          target: 'planning',
          actions: assign({
            currentAgent: () => 'PLAN_AGENT' as KnownAgentType,
            currentStep: () => 'plan',
            status: () => ({ type: 'IN_PROGRESS', currentAgent: 'PLAN_AGENT' as KnownAgentType })
          })
        }
      }
    },
    planning: {
      on: {
        AGENT_COMPLETED: {
          target: 'awaitingPlanApproval',
          actions: assign({
            status: ({ event }) => {
              const ev = event as Extract<MachineEvent, { type: 'AGENT_COMPLETED' }>;
              return { type: 'AWAITING_PLAN_APPROVAL', planId: ev.output?.planId || 'unknown' };
            },
            approvalData: ({ event }) => (event as any).output
          })
        },
        WORKFLOW_ERROR: 'error'
      }
    },
    awaitingPlanApproval: {
      on: {
        APPROVE_GATE: {
          target: 'designing',
          actions: assign({
            currentAgent: () => 'DESIGN_ALCHEMIST_AGENT' as KnownAgentType,
            currentStep: () => 'design',
            status: () => ({ type: 'IN_PROGRESS', currentAgent: 'DESIGN_ALCHEMIST_AGENT' as KnownAgentType })
          })
        },
        REJECT_GATE: 'failed'
      }
    },
    designing: {
      on: {
        AGENT_COMPLETED: {
          target: 'awaitingDesignApproval',
          actions: assign({
            status: ({ event }) => {
              const ev = event as Extract<MachineEvent, { type: 'AGENT_COMPLETED' }>;
              return { type: 'AWAITING_DESIGN_APPROVAL', assetPreviewUrl: ev.output?.previewUrl || 'http://placeholder.url' };
            },
            approvalData: ({ event }) => (event as any).output
          })
        },
        WORKFLOW_ERROR: 'error'
      }
    },
    awaitingDesignApproval: {
      on: {
        APPROVE_GATE: {
          target: 'coding',
          actions: assign({
            currentAgent: () => 'BACKEND_ARCHITEKT_AGENT' as KnownAgentType,
            currentStep: () => 'backend',
            status: () => ({ type: 'IN_PROGRESS', currentAgent: 'BACKEND_ARCHITEKT_AGENT' as KnownAgentType })
          })
        },
        REJECT_GATE: 'failed'
      }
    },
    coding: {
      on: {
        AGENT_COMPLETED: {
          target: 'testing', // Wir überspringen Gates für den Moment zur Vereinfachung des Tests
          actions: assign({
            currentAgent: () => 'QA_GURU_AGENT' as KnownAgentType,
            currentStep: () => 'qa',
            status: () => ({ type: 'IN_PROGRESS', currentAgent: 'QA_GURU_AGENT' as KnownAgentType })
          })
        },
        WORKFLOW_ERROR: 'error'
      }
    },
    testing: {
      on: {
        AGENT_COMPLETED: 'completed',
        WORKFLOW_ERROR: 'error'
      }
    },
    completed: {
      type: 'final',
      entry: assign({ 
        status: () => ({ type: 'SUCCESS', finalArtifactPath: '/artifacts/latest' }) 
      })
    },
    error: {
      entry: assign({
        status: ({ event }) => {
          const ev = event as any;
          return { type: 'FAILED', errorCode: ev.code || 'UNKNOWN_ERROR', reason: ev.message || 'An error occurred' };
        }
      })
    },
    failed: {
      type: 'final',
      entry: assign({
        status: ({ context }) => ({ 
          type: 'FAILED', 
          errorCode: 'GATE_REJECTED', 
          reason: `Approval rejected at ${context.currentStep}` 
        })
      })
    }
  }
});
