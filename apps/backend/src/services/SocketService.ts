import { Server } from 'socket.io';
import { injectable, inject } from 'tsyringe';
import { Logger } from '../types/Logger';
import { OrionOrchestrator } from '../orchestrator/OrionOrchestrator';

@injectable()
export class SocketService {
  private io: Server | null = null;

  constructor(
    @inject('Logger') private logger: Logger,
    @inject(OrionOrchestrator) private orion: OrionOrchestrator
  ) {}

  public init(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      this.logger.info('SocketService', 'connection', `Client verbunden: ${socket.id}`);

      socket.on('agent_request', async (data: any) => {
        try {
          await this.orion.processRequestStreaming(
            {
              agent: data.agent,
              input: data.input,
              sessionData: data.sessionData
            },
            (chunk) => {
              socket.emit('agent_response_chunk', { chunk });
            }
          );
        } catch (error) {
          this.logger.error('SocketService', 'agent_request', 'Fehler bei Orion-Anfrage', error);
          socket.emit('agent_error', { message: 'Fehler bei der Verarbeitung.' });
        }
      });

      socket.on('disconnect', () => {
        this.logger.info('SocketService', 'disconnect', `Client getrennt: ${socket.id}`);
      });
    });

    this.logger.info('SocketService', 'init', 'Socket.io erfolgreich initialisiert.');
  }
}
