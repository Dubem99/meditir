import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../../utils/jwt';
import { prisma } from '../../config/database';
import { transcribeAudioBuffer } from './transcription.service';
import { Dialect, SessionStatus } from '../../types/enums';
import { logger } from '../../utils/logger';

interface AudioChunkPayload {
  sessionId: string;
  chunk: ArrayBuffer;
  dialect: Dialect;
  speakerTag?: string;
  startMs?: number;
}

// Per-session chunk buffer: accumulate ~3s of audio before sending to Whisper
const sessionBuffers = new Map<
  string,
  { chunks: Buffer[]; timeout: ReturnType<typeof setTimeout> | null; startMs: number }
>();

const BUFFER_FLUSH_MS = 3000;

export const registerTranscriptionHandlers = (io: Server, socket: Socket): void => {
  /**
   * Client joins the consultation room.
   * The roomToken is stored on the session and serves as the Socket.io room ID.
   */
  socket.on('join:session', async (data: { roomToken: string; accessToken: string }) => {
    try {
      const payload = verifyAccessToken(data.accessToken);
      const session = await prisma.consultationSession.findFirst({
        where: { roomToken: data.roomToken, status: SessionStatus.IN_PROGRESS },
      });

      if (!session) {
        socket.emit('error', { message: 'Session not found or not in progress' });
        return;
      }

      // Authorize: only doctor and patient of this session can join
      const isAuthorized = await (async () => {
        if (payload.role === 'HOSPITAL_ADMIN' || payload.role === 'SUPER_ADMIN') return true;
        if (payload.role === 'DOCTOR') {
          const doctor = await prisma.doctor.findFirst({
            where: { userId: payload.userId, id: session.doctorId },
          });
          return !!doctor;
        }
        if (payload.role === 'PATIENT') {
          const patient = await prisma.patient.findFirst({
            where: { userId: payload.userId, id: session.patientId },
          });
          return !!patient;
        }
        return false;
      })();

      if (!isAuthorized) {
        socket.emit('error', { message: 'Not authorized to join this session' });
        return;
      }

      socket.join(data.roomToken);
      socket.emit('joined:session', { sessionId: session.id, roomToken: data.roomToken });
      logger.debug('Socket joined session room', { roomToken: data.roomToken, userId: payload.userId });
    } catch {
      socket.emit('error', { message: 'Invalid token' });
    }
  });

  /**
   * Receive raw audio chunk from doctor's browser.
   * Buffer chunks for BUFFER_FLUSH_MS then send to Whisper.
   */
  socket.on('transcription:audio_chunk', async (data: AudioChunkPayload) => {
    const { sessionId, chunk, dialect, speakerTag, startMs } = data;

    if (!sessionBuffers.has(sessionId)) {
      sessionBuffers.set(sessionId, { chunks: [], timeout: null, startMs: startMs || 0 });
    }

    const buffer = sessionBuffers.get(sessionId)!;
    buffer.chunks.push(Buffer.from(chunk));

    // Clear existing debounce timer and reset
    if (buffer.timeout) clearTimeout(buffer.timeout);

    buffer.timeout = setTimeout(async () => {
      const accumulated = Buffer.concat(buffer.chunks);
      buffer.chunks = [];
      buffer.timeout = null;

      if (accumulated.length < 1000) return; // Skip tiny buffers (silence)

      try {
        const transcription = await transcribeAudioBuffer(
          sessionId,
          accumulated,
          'audio/webm',
          dialect,
          speakerTag,
          startMs
        );

        if (transcription) {
          // Broadcast to all room participants
          const session = await prisma.consultationSession.findUnique({
            where: { id: sessionId },
            select: { roomToken: true },
          });
          if (session?.roomToken) {
            io.to(session.roomToken).emit('transcription:new_segment', {
              id: transcription.id,
              text: transcription.text,
              speakerTag: transcription.speakerTag,
              startMs: transcription.startMs,
              createdAt: transcription.createdAt,
            });
          }
        }
      } catch (err) {
        logger.error('Real-time transcription error', { error: err, sessionId });
        socket.emit('transcription:error', { message: 'Transcription failed for this chunk' });
      }
    }, BUFFER_FLUSH_MS);
  });

  socket.on('leave:session', (roomToken: string) => {
    socket.leave(roomToken);
  });

  socket.on('disconnect', () => {
    logger.debug('Socket disconnected', { socketId: socket.id });
  });
};
