import { Server as SocketServer, Socket } from 'socket.io';

export function registerNotificationHandlers(_io: SocketServer, socket: Socket): void {
  socket.on('notifications:subscribe', () => {
    const userId = socket.data.userId as string | null;
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  socket.on('notifications:mark-read', (notificationId: string) => {
    const userId = socket.data.userId as string | null;
    if (!userId) return;
    socket.emit('notification:read', { notificationId });
  });
}
