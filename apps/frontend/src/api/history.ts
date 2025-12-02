import type { RunsResponse, StatsResponse, SSEEvent } from '@/types/History'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export const fetchStats = async (): Promise<StatsResponse> => {
  const res = await fetch(`${API_BASE}/api/stats`)
  if (!res.ok) throw new Error(`[fetchStats] HTTP ${res.status}`)
  return res.json()
}

export const fetchRuns = async (
  page: number = 1,
  limit: number = 50,
  status?: string,
  search?: string
): Promise<RunsResponse> => {
  const url = new URL(`${API_BASE}/api/runs`)
  url.searchParams.append('limit', String(limit))
  url.searchParams.append('offset', String((page - 1) * limit))
  if (status && status !== 'all') url.searchParams.append('status', status)
  if (search?.trim()) url.searchParams.append('search', search)
  
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`[fetchRuns] HTTP ${res.status}`)
  return res.json()
}

export const fetchRunById = async (id: number) => {
  const res = await fetch(`${API_BASE}/api/runs/${id}`)
  if (!res.ok) throw new Error(`[fetchRunById] HTTP ${res.status}`)
  return res.json()
}

export const subscribeToStreamStatus = (
  onMessage: (event: SSEEvent) => void,
  onError: (error: Error) => void
): EventSource => {
  const eventSource = new EventSource(`${API_BASE}/api/runs/stream/status`)

  eventSource.addEventListener('run_status_update', (event: Event) => {
    try {
      const data = JSON.parse((event as MessageEvent).data)
      onMessage({ type: 'run_status_update', payload: data })
    } catch (err) {
      onError(new Error(`[SSE] Parse error: ${err}`))
    }
  })

  eventSource.addEventListener('stats_update', (event: Event) => {
    try {
      const data = JSON.parse((event as MessageEvent).data)
      onMessage({ type: 'stats_update', payload: data })
    } catch (err) {
      onError(new Error(`[SSE] Parse error: ${err}`))
    }
  })

  eventSource.addEventListener('run_new', (event: Event) => {
    try {
      const data = JSON.parse((event as MessageEvent).data)
      onMessage({ type: 'run_new', payload: data })
    } catch (err) {
      onError(new Error(`[SSE] Parse error: ${err}`))
    }
  })

  eventSource.onerror = () => {
    onError(new Error('[SSE] Connection error'))
    eventSource.close()
  }

  return eventSource
}
