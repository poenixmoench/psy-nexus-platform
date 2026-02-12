import { defineStore } from 'pinia';
import { io, Socket } from 'socket.io-client';

export const useWebSocketStore = defineStore('websocket', {
  state: () => ({
    socket: null as Socket | null,
    isConnected: false,
    pendingGate: null as { gateType: string; runId?: string; data?: any } | null,
  }),
  actions: {
    connect(token: string) {
      if (this.socket) return;
      this.socket = io('', { path: '/socket.io/', 
        auth: { token },
        transports: ['websocket']
      });
      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('🚀 Nexus-Socket verbunden auf Port 3001');
      });
      this.socket.on('nexus_gate_reached', (payload) => {
        console.log('Gate erreicht:', payload.gateType);
        this.pendingGate = payload;
      });
      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('⚠️ Nexus-Socket getrennt');
      });
    },
    sendMessage(event: string, data: any) {
      if (this.socket) {
        this.socket.emit(event, data);
      }
    },
    on(event: string, callback: (data: any) => void) {
      if (this.socket) {
        this.socket.on(event, callback);
      }
    }
  },
});
