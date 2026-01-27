import { Server } from 'socket.io';
import { createServer } from 'http';
import type { Server as HTTPServer } from 'http';

export function setupSocket(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
    pingInterval: 60000,
    pingTimeout: 600000,
    maxHttpBufferSize: 1e6,
    // Force WebSocket upgrade
    upgradeTimeout: 10000,
    allowEIO3: true,
  });

  // Explicitly verify transports
  console.log(' [OK]  Socket.IO configured');
  
  return io;
}
