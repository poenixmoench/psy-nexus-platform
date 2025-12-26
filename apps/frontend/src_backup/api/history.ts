const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export async function getHistory() {
  const res = await fetch(`${API_BASE}/history`)
  return res.json()
}

export async function addToHistory(item: any) {
  const res = await fetch(`${API_BASE}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  })
  return res.json()
}
