export const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch {
    return 'Ungültiges Datum'
  }
}

export const formatDuration = (ms: number | null | undefined): string => {
  if (ms === null || ms === undefined || ms === 0) return '0.00 s'
  return (ms / 1000).toFixed(2) + ' s'
}

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '…'
}

export const statusToGerman = (status: string): string => {
  const statusMap: Record<string, string> = {
    SUCCESS: 'Erfolgreich',
    FAILED: 'Fehlgeschlagen',
    IN_PROGRESS: 'Läuft',
    PENDING: 'Ausstehend'
  }
  return statusMap[status] || status
}

export const sanitizeText = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
