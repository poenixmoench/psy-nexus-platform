import { createMachine, assign } from 'xstate';
import { RunStatus, KnownAgentType } from '@shared/types/AgentTypes';

interface MachineContext {
  currentAgent: KnownAgentType | null;
  currentStep: string;
  status: RunStatus;
  initialPrompt: string; // NEU: Hier speichern wir den Befehl
  approvalData?: any;
  error?: string;
}

type MachineEvent =
  | { type: 'START_WORKFLOW'; input: any }
  | { type: 'AGENT_COMPLETED'; agent: KnownAgentType; output: any }
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
    initialPrompt: '', 
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
            // WICHTIG: Den Prompt aus dem Event in den Kontext retten!
            initialPrompt: ({ event }) => (event as any).input?.initialPrompt || 'START',
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
            status: ({ event }) => ({ 
              type: 'AWAITING_PLAN_APPROVAL', 
              planId: (event as any).output?.planId || 'unknown' 
            }),
            approvalData: ({ event }) => (event as any).output
          })
        }
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
        }
      }
    },
    designing: {
      on: { AGENT_COMPLETED: 'completed' } // Vereinfacht für den Test
    },
    completed: { type: 'final' }
  }
});
