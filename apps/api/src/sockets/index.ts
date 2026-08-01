import { Server as SocketServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { registerLiveChatHandlers } from './liveChat';
import { registerNotificationHandlers } from './notifications';

export function initSockets(io: SocketServer): void {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.slice(7);
    if (!token) {
      socket.data.userId = null;
      return next();
    }
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      socket.data.role = payload.role;
      next();
    } catch {
      socket.data.userId = null;
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string | null;

    if (userId) {
      socket.join(`user:${userId}`);
    }

    registerLiveChatHandlers(io, socket);
    registerNotificationHandlers(io, socket);

    socket.on('upload:subscribe', (sessionId: string) => {
      socket.join(`upload:${sessionId}`);
    });

    socket.on('disconnect', () => {
      // cleanup handled by socket.io room leave
    });
  });
}

export function emitUploadProgress(io: SocketServer, sessionId: string, data: unknown): void {
  io.to(`upload:${sessionId}`).emit('upload:progress', data);
}

export function emitNotification(io: SocketServer, userId: string, notification: unknown): void {
  io.to(`user:${userId}`).emit('notification:new', notification);
}
