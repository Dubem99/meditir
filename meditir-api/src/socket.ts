import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import { registerTranscriptionHandlers } from './modules/transcription/transcription.socket';
import { logger } from './utils/logger';

export const createSocketServer = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.ALLOWED_ORIGINS.split(','),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    maxHttpBufferSize: 25e6, // 25MB for audio chunks
  });

  io.on('connection', (socket) => {
    logger.debug('New socket connection', { socketId: socket.id });
    registerTranscriptionHandlers(io, socket);
  });

  return io;
};
