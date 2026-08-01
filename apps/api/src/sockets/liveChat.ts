import { Server as SocketServer, Socket } from 'socket.io';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: number;
}

export function registerLiveChatHandlers(io: SocketServer, socket: Socket): void {
  socket.on('live:join', (streamId: string) => {
    socket.join(`live:${streamId}`);
    socket.data.currentStream = streamId;
  });

  socket.on('live:leave', (streamId: string) => {
    socket.leave(`live:${streamId}`);
    if (socket.data.currentStream === streamId) {
      socket.data.currentStream = null;
    }
  });

  socket.on('live:chat', (data: { streamId: string; text: string; username?: string }) => {
    const userId = socket.data.userId as string | null;
    if (!userId || !data.text?.trim()) return;

    const message: ChatMessage = {
      id: `${Date.now()}-${userId}`,
      userId,
      username: data.username || 'Viewer',
      text: data.text.trim().slice(0, 500),
      timestamp: Date.now(),
    };

    io.to(`live:${data.streamId}`).emit('live:chat', message);
  });
}
