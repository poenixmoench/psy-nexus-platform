const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.psy-nexus.live'

export async function getHistory() {
  const res = await fetch(`${API_BASE}/history`)
  return res.json()
}

export async function addToHistory(item: any) {
  const res = await fetch(`${API_BASE}/history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  })
  return res.json()
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`)
  return res.json()
}

export async function fetchRuns() {
  const res = await fetch(`${API_BASE}/runs`)
  return res.json()
}

export async function subscribeToStreamStatus(callback: (status: any) => void) {
  // WebSocket or polling implementation
}
