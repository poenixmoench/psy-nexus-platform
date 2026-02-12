export type RunStatus = 'PENDING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILED'

export interface OrchestrationRun {
  id: number
  userGoal: string
  finalOutput: string | null
  status: RunStatus
  durationMs: number | null
  createdAt: string
  updatedAt?: string
  agentOutputs?: {
    orchestrator?: string
    developer?: string
    reviewer?: string
  }
}

export interface Stats {
  total: number
  successful: number
  failed: number
  inProgress: number
  avgDurationMs: number
}

export interface PaginationState {
  page: number
  limit: number
  total: number
}

export interface RunsResponse {
  data: OrchestrationRun[]
  count: number
}

export interface StatsResponse extends Stats {}

export interface SSEEvent {
  type: 'run_status_update' | 'stats_update' | 'run_new'
  payload: {
    runId?: number
    newStatus?: RunStatus
    newStats?: Stats
    newRun?: OrchestrationRun
  }
}
