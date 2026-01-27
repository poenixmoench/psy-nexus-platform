import { Server, WebSocket } from 'ws';
import * as http from 'http';

interface ClientWithSocket {
  ws: WebSocket;
  runId: string;
}

export class WebSocketService {
  private wss: Server;
  private clients: Set<ClientWithSocket> = new Set();

  constructor(server: http.Server) {
    this.wss = new Server({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
      if (request.url?.startsWith('/ws/run')) {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
          this.handleConnection(ws, request.url as string);
        });
      } else {
        socket.destroy();
      }
    });
  }

  private handleConnection(ws: WebSocket, url: string): void {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const runId = urlParams.get('runId');

    if (!runId) {
      ws.close(1008, 'Missing runId parameter.');
      return;
    }

    const client: ClientWithSocket = { ws, runId };
    this.clients.add(client);
    console.log(`🌐 [WS] Client: ${runId} (Total: ${this.clients.size})`);

    ws.send(JSON.stringify({ type: 'STATUS_INIT', runId, timestamp: new Date().toISOString() }));

    ws.on('close', () => {
      this.clients.delete(client);
      console.log(`🌐 [WS] Disconnected: ${runId}`);
    });
  }

  public broadcast(runId: string, data: any): void {
    const payload = JSON.stringify({ runId, timestamp: new Date().toISOString(), data });
    let sent = 0;
    for (const client of this.clients) {
      if (client.runId === runId && client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(payload);
          sent++;
        } catch (error) {
          console.error(` [ERR]  WS Send failed: ${error}`);
          client.ws.close();
        }
      }
    }
    if (sent > 0) console.log(` [DEBUG]  [WS] Broadcast ${runId}: ${sent} clients`);
  }

  public getActiveConnections(): number {
    return this.clients.size;
  }
}
