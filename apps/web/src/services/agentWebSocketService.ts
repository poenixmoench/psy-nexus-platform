export class AgentWebSocketService {
  private ws: WebSocket | null = null
  private url: string
  private listeners: Map<string, Function[]> = new Map()

  constructor(wsUrl: string = 'ws://localhost:3000/api/agents/ws') {
    this.url = wsUrl
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('🔌 WebSocket connected')
          resolve()
        }

        this.ws.onmessage = (event) => {
          const message = JSON.parse(event.data)
          this.emit(message.type, message.data)
        }

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('🔌 WebSocket disconnected')
          setTimeout(() => this.reconnect(), 3000)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  private reconnect(): void {
    console.log('🔄 Attempting to reconnect...')
    this.connect().catch(() => {
      console.error('❌ Reconnection failed')
    })
  }

  on(eventType: string, callback: Function): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, [])
    }
    this.listeners.get(eventType)!.push(callback)
  }

  off(eventType: string, callback: Function): void {
    const callbacks = this.listeners.get(eventType)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(eventType: string, data: any): void {
    const callbacks = this.listeners.get(eventType) || []
    callbacks.forEach(cb => cb(data))
  }

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }
}

export const agentWs = new AgentWebSocketService()
