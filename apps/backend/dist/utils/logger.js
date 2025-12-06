export class Logger {
    info(message) {
        console.log(`\x1b[36m[PSY-NEXUS]\x1b[0m ${message}`);
    }
    error(message) {
        console.error(`\x1b[31m[PSY-NEXUS]\x1b[0m ${message}`);
    }
    warn(message) {
        console.warn(`\x1b[33m[PSY-NEXUS]\x1b

### **3. WebSocketService.ts**
cat > src/services/WebSocketService.ts << 'EOF'
import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { Logger } from '../utils/logger.js';

export class WebSocketService {
private static instance: WebSocketService;
private io: Server | null = null;
private connectedClients = new Set<string>();
private logger = new Logger();

private constructor() {}

public static getInstance(): WebSocketService {
if (!WebSocketService.instance) {
WebSocketService.instance = new WebSocketService();
}
return WebSocketService.instance;
}

public init(httpServer: any): void {
if (this.io) {
this.logger.warn('WebSocket-Service bereits initialisiert');
return;
}
this.io = new Server(httpServer, {
path: '/ws/orchestration',
cors: { origin: '*', methods: ['GET', 'POST'] }
});

text
this.io.on('connection', (socket: Socket) => {
  this.connectedClients.add(socket.id);
  this.logger.info(`, Verbindung, hergestellt, $, { socket, : .id } | Clients, $, { this: .connectedClients.size } `);
  
  socket.on('disconnect', () => {
    this.connectedClients.delete(socket.id);
    this.logger.info(`, Verbindung, getrennt, $, { socket, : .id } | Clients, $, { this: .connectedClients.size } `);
  });
});

this.logger.info('WebSocket-Service initialisiert auf /ws/orchestration');
}

public broadcast(message: string): void {
if (!this.io) {
this.logger.warn('WebSocket-Service nicht initialisiert');
return;
}
this.io.emit('message', message);
}

public getConnectedClients(): number {
return this.connectedClients.size;
}
}
        );
    }
}
