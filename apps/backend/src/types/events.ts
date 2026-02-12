export enum NexusEvent {
  GATE_REACHED = 'orchestrator.gate.reached',
  STATUS_UPDATE = 'orchestrator.status.update',
  THINKING_LOG = 'orchestrator.thinking.log'
}

export interface GateReachedPayload {
  runId: string;
  gateType: string;
  agentId: string;
  timestamp: number;
}
