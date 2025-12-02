export type RunStatus = 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface OrchestrationRun {
  id: number;
  userGoal: string;
  finalOutput: string | null;
  agentOutputs: Record<string, string> | null;
  status: RunStatus;
  durationMs: number | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}
