import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../../utils/jwt';
import { prisma } from '../../config/database';
import { Dialect, SessionStatus, SyncStatus } from '../../types/enums';
import { logger } from '../../utils/logger';

interface TextSegmentPayload {
  sessionId: string;
  text: string;
  dialect: Dialect;
  speakerTag?: string;
  startMs?: number;
}

export const registerTranscriptionHandlers = (io: Server, socket: Socket): void => {
  /**
   * Client joins a consultation room using the session's roomToken.
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

      // Authorize: doctor or patient of this session, or admin
      const authorized = await (async () => {
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

      if (!authorized) {
        socket.emit('error', { message: 'Not authorized to join this session' });
        return;
      }

      socket.join(data.roomToken);
      socket.emit('joined:session', { sessionId: session.id, roomToken: data.roomToken });
      logger.debug('Socket joined session room', { roomToken: data.roomToken, userId: payload.userId });
    } catch {
      socket.emit('error', { message: 'Invalid or expired token' });
    }
  });

  /**
   * Receive a finalized text segment from the browser's Web Speech API.
   * Persists to DB and broadcasts to all room participants.
   */
  socket.on('transcription:text_segment', async (data: TextSegmentPayload) => {
    const { sessionId, text, dialect, speakerTag, startMs } = data;

    if (!text?.trim()) return;

    try {
      const session = await prisma.consultationSession.findUnique({
        where: { id: sessionId },
        select: { id: true, roomToken: true, status: true },
      });

      if (!session || session.status !== SessionStatus.IN_PROGRESS) return;

      const transcription = await prisma.transcription.create({
        data: {
          sessionId,
          text: text.trim(),
          dialect: dialect ?? Dialect.NIGERIAN_ENGLISH,
          speakerTag: speakerTag ?? 'DOCTOR',
          startMs: startMs ?? null,
          syncStatus: SyncStatus.SYNCED,
        },
      });

      // Broadcast to everyone in the room (doctor + any listening patients)
      if (session.roomToken) {
        io.to(session.roomToken).emit('transcription:new_segment', {
          id: transcription.id,
          text: transcription.text,
          speakerTag: transcription.speakerTag,
          startMs: transcription.startMs,
          createdAt: transcription.createdAt,
        });
      }
    } catch (err) {
      logger.error('Failed to save text segment', { error: err, sessionId });
      socket.emit('transcription:error', { message: 'Failed to save transcription' });
    }
  });

  socket.on('leave:session', (roomToken: string) => {
    socket.leave(roomToken);
  });

  socket.on('disconnect', () => {
    logger.debug('Socket disconnected', { socketId: socket.id });
  });
};
