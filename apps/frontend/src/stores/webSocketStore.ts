import { defineStore } from 'pinia';
export const useWebSocketStore = defineStore('websocket', {
  state: () => ({ isConnected: true, messageHandler: (data: any) => console.log('WS Mock:', data) }),
  actions: {
    connect(token: string) { console.log('WS Mock Connected:', token); },
    setMessageHandler(handler: (data: any) => void) { this.messageHandler = handler; },
    sendMessage(message: any) { console.log('WS Mock Sending:', message); }
  },
});
