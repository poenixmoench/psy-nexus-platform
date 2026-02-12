import { Server, Socket } from 'socket.io';
import { injectable, inject } from 'tsyringe';
import { Logger } from '../types/Logger';
import { OrionOrchestrator } from '../orchestrator/OrionOrchestrator';
import { EventEmitter2 } from 'eventemitter2';
import { NexusEvent } from '../types/events';

@injectable()
export class SocketService {
  private io: Server | null = null;

  constructor(
    @inject('Logger') private logger: Logger,
    @inject(OrionOrchestrator) private orion: OrionOrchestrator,
    @inject("EventEmitter") private eventEmitter: EventEmitter2
  ) {}

  public async init(server: any): Promise<void> {
    try {
      this.io = new Server(server, {
        cors: {
          origin: process.env.CORS_ORIGIN || "*",
          methods: ["GET", "POST"],
          credentials: true
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000
      });

      this.io.on('connection', (socket: Socket) => {
        this.logger.info('SocketService', 'connection', `Client verbunden: ${socket.id}`);

        const connectionTimeout = setTimeout(() => {
          if (!socket.connected) {
            socket.disconnect(true);
          }
        }, 30000);

        socket.on('agent_request', async (data: any) => {
          try {
            if (!data.agent || !data.input) {
              socket.emit('agent_error', { message: 'Ungültige Anfrage: agent und input erforderlich' });
              return;
            }

            await this.orion.processRequestStreaming(
              {
                agent: data.agent,
                input: data.input,
                sessionData: data.sessionData || {}
              },
              (chunk) => {
                if (socket.connected) {
                  socket.emit('agent-chunk', { chunk, timestamp: Date.now() });
                }
              }
            );
            socket.emit('agent-done', { success: true, completedAt: Date.now() });
          } catch (error) {
            this.logger.error('SocketService', 'agent_request', 'Fehler bei Orion-Anfrage', error);
            if (socket.connected) {
              socket.emit('agent_error', { 
                message: error.message || 'Interner Fehler bei der Verarbeitung.',
                errorId: Math.random().toString(36).substr(2, 9)
              });
            }
          }
        });

        socket.on('test-gate-trigger', (data) => { 
          if (this.io) this.io.emit('nexus_gate_reached', data); 
        });

        socket.on('disconnect', () => {
          clearTimeout(connectionTimeout);
          this.logger.info('SocketService', 'disconnect', `Client getrennt: ${socket.id}`);
        });
      });

      this.eventEmitter.on(NexusEvent.GATE_REACHED, (payload) => {
        if (this.io) {
          this.io.emit('nexus_gate_reached', payload);
        }
      });

      this.logger.info('SocketService', 'init', 'Socket.io erfolgreich initialisiert.');
    } catch (error) {
      this.logger.error('SocketService', 'init', 'Fehler bei Socket-Initialisierung', error);
      throw error;
    }
  }
}

if (typeof module !== 'undefined') {
    (module.exports as any).SocketService = SocketService;
}
