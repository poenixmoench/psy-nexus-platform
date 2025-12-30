import { Server } from 'socket.io';
import { OrionOrchestrator } from '../orchestrator/OrionOrchestrator';
import { OrionAgent } from '../agents/OrionAgent';
import { PlanAgent } from '../agents/PlanAgent';

export class SocketService {
  private io: Server;
  private orchestrator: OrionOrchestrator;

  constructor(server: any) {
    this.io = new Server(server, { cors: { origin: "*" } });
    
    // Initialisierung des Production-Systems
    this.orchestrator = new OrionOrchestrator("psy-project-alpha");
    
    // Agenten im System anmelden
    this.orchestrator.registerAgent(new OrionAgent());
    this.orchestrator.registerAgent(new PlanAgent());
    
    this.setupHandlers();
  }

  private setupHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🚀 Master-Terminal verbunden: ${socket.id}`);

      socket.on('orion-dialogue', async (data) => {
        // Mapping auf JSON-RPC Standard
        const rpcRequest = {
          jsonrpc: "2.0",
          method: "orion-dialogue",
          params: { message: data.message },
          id: Date.now()
        };

        console.log(`📥 RPC-Request erhalten: Phase ${rpcRequest.id}`);
        
        // Orchestrator verarbeitet die Logik
        const response = await this.orchestrator.handleMessage(rpcRequest);
        
        // Antwort an Frontend senden
        socket.emit('orion-response', {
          agent: response.result.agentName,
          text: response.result.content,
          state: response.result.state
        });
      });

      socket.on('disconnect', () => console.log(`📡 Verbindung getrennt`));
    });
  }
}
