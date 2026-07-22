import { Server, Socket } from 'socket.io';
import { AIService } from './AIService';

export class SocketService {
  private aiService = new AIService();

  constructor(private io: Server) {
    this.setupListeners();
  }

  private setupListeners() {
    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);

      socket.on('agent-message', async (data: any) => {
        const { agentName, message } = data;
        try {
          await this.aiService.askAIStream(
            message,
            (chunk: string, model: string) => {
              if (socket.connected) {
                socket.emit('agent-chunk', { 
                  agent: agentName, 
                  chunk, 
                  model, 
                  timestamp: Date.now() 
                });
              }
            },
            agentName
          );
          socket.emit('agent-done', { agent: agentName });
        } catch (error) {
          console.error('Streaming Error:', error);
          socket.emit('agent-error', { error: 'Nexus Stream Interrupted' });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
}
