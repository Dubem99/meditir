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
    logger.debug('New socket connection', { socketId: socket.id });
    registerTranscriptionHandlers(io, socket);
    registerPresenceHandlers(io, socket);
  });

  return io;
};
