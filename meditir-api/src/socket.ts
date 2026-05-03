import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import { registerTranscriptionHandlers } from './modules/transcription/transcription.socket';
import { registerPresenceHandlers } from './modules/messages/messages.socket';
import { logger } from './utils/logger';

let ioInstance: Server | null = null;

export const getIO = (): Server => {
  if (!ioInstance) throw new Error('Socket.io server not initialized');
  return ioInstance;
};

// Helpers — room naming for targeted emits.
export const userRoom = (userId: string) => `user:${userId}`;
export const hospitalRoom = (hospitalId: string) => `hospital:${hospitalId}`;

export const createSocketServer = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.ALLOWED_ORIGINS.split(','),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    maxHttpBufferSize: 25e6, // 25MB for audio chunks
  });

  ioInstance = io;

  io.on('connection', (socket) => {
    logger.info('[socket] new connection', {
      socketId: socket.id,
      handshake: {
        address: socket.handshake.address,
        url: socket.handshake.url,
        transport: (socket.conn as { transport?: { name?: string } } | undefined)?.transport?.name,
      },
    });
    socket.onAny((eventName, ...args) => {
      logger.info('[socket] received event', {
        socketId: socket.id,
        eventName,
        argCount: args.length,
        argTypes: args.map((a) => typeof a),
      });
    });
    registerTranscriptionHandlers(io, socket);
    registerPresenceHandlers(io, socket);
  });

  return io;
};
