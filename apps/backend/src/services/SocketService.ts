import { Server, Socket } from 'socket.io';
import { OllamaService } from './OllamaService';

export class SocketService {
  private static io: Server;

  static init(httpServer: any) {  // ✅ Hier: init statt initialize!
    const io = new Server(httpServer, {
      cors: { origin: '*' },
      transports: ['websocket', 'polling']
    });

    SocketService.io = io;

    io.on('connection', (socket: Socket) => {
      console.log('✅ [CONN] Client connected:', socket.id);

      socket.on('agent-message', async (data: any) => {
        console.log('📥 Agent Message:', data.agentName, '-', data.message);

        const agentName = data.agentName || 'ORION';
        const userMessage = data.message || '';

        try {
          // Stream mit Ollama!
          await OllamaService.generateStream(
            userMessage,
            agentName,
            (chunk: string) => {
              socket.emit('agent-chunk', {
                agent: agentName,
                content: chunk
              });
            }
          );

          console.log('✅ Stream completed');
          // ✅ agent-done Event!
          socket.emit('agent-done', {
            agent: agentName,
            timestamp: new Date().toISOString()
          });
        } catch (err: any) {
          console.error('❌ Error:', err.message);
          socket.emit('agent-error', { 
            agent: agentName,
            message: err.message 
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('🔌 [CONN] Client disconnected:', socket.id);
      });
    });
  }

  static getIO() {
    return SocketService.io;
  }
}
