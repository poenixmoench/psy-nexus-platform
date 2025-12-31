import { Server } from 'socket.io';

export class SocketService {
  private static io: Server;

  static init(io: Server) {
    SocketService.io = io;
    SocketService.io.on('connection', (socket: any) => {
      console.log('🔌 Client connected:', socket.id);
      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
      });
    });
  }

  static getIO() {
    return SocketService.io;
  }
}
