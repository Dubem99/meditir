import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../../utils/jwt';
import { prisma } from '../../config/database';
import { Dialect, SessionStatus, SyncStatus } from '../../types/enums';
import { logger } from '../../utils/logger';
import { OpenAIRealtimeConnection } from './realtime.openai';

interface TextSegmentPayload {
  sessionId: string;
  text: string;
  dialect: Dialect;
  speakerTag?: string;
  startMs?: number;
}

interface RealtimeStartPayload {
  accessToken: string;
  sessionId: string;
  dialect: Dialect;
}

// Tracks one in-flight realtime transcription per socket. Cleaned up when the
// socket disconnects or transcribe:stop is received.
interface RealtimeContext {
  conn: OpenAIRealtimeConnection;
  sessionId: string;
  dialect: Dialect;
  hospitalId: string;
  userId: string;
  speakerTag: string;
  recordingStartedAt: number;
  roomToken: string | null;
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

  // ─── Realtime STT bridge ──────────────────────────────────────────────
  //
  // Browser sends:
  //   transcribe:start  { accessToken, sessionId, dialect }
  //   transcribe:audio  ArrayBuffer (PCM16 mono 24kHz, raw bytes)
  //   transcribe:stop
  //
  // Server emits back to this socket:
  //   transcribe:partial { text }   — streaming delta, append to interim
  //   transcribe:final   { transcription }  — saved Transcription row
  //   transcribe:error   { message }
  //   transcribe:closed

  let rt: RealtimeContext | null = null;

  const teardown = () => {
    if (rt) {
      rt.conn.close();
      rt = null;
    }
  };

  socket.on('transcribe:start', async (payload: RealtimeStartPayload) => {
    logger.info('[STT] transcribe:start received', {
      socketId: socket.id,
      sessionId: payload?.sessionId,
      dialect: payload?.dialect,
      hasToken: !!payload?.accessToken,
    });
    try {
      const claims = verifyAccessToken(payload.accessToken);
      logger.info('[STT] claims verified', { role: claims.role, userId: claims.userId });
      if (claims.role !== 'DOCTOR') {
        logger.warn('[STT] non-doctor role', { role: claims.role });
        socket.emit('transcribe:error', { message: 'Doctors only' });
        return;
      }

      // Verify session belongs to this doctor's hospital and is in progress.
      const session = await prisma.consultationSession.findUnique({
        where: { id: payload.sessionId },
        select: { id: true, hospitalId: true, doctorId: true, status: true, roomToken: true },
      });
      if (!session) {
        socket.emit('transcribe:error', { message: 'Session not found' });
        return;
      }
      if (session.status !== SessionStatus.IN_PROGRESS) {
        socket.emit('transcribe:error', { message: 'Session is not in progress' });
        return;
      }
      const doctor = await prisma.doctor.findFirst({
        where: { userId: claims.userId, id: session.doctorId },
        select: { id: true },
      });
      if (!doctor) {
        socket.emit('transcribe:error', { message: 'Not authorized for this session' });
        return;
      }

      // Replace any previous realtime context on this socket — start always
      // wins, in case the browser starts a fresh recording without stop.
      teardown();

      const dialect = payload.dialect ?? Dialect.NIGERIAN_ENGLISH;
      const recordingStartedAt = Date.now();
      const roomToken = session.roomToken;
      const conn = new OpenAIRealtimeConnection(dialect, {
        onPartial: (text) => {
          socket.emit('transcribe:partial', { text });
        },
        onFinal: async (text) => {
          try {
            const startMs = Date.now() - recordingStartedAt;
            const transcription = await prisma.transcription.create({
              data: {
                sessionId: session.id,
                text,
                dialect,
                speakerTag: rt?.speakerTag ?? 'DOCTOR',
                startMs,
                syncStatus: SyncStatus.SYNCED,
              },
            });
            socket.emit('transcribe:final', { transcription });
            // Broadcast to the room so admin/observer surfaces stay in sync.
            if (roomToken) {
              io.to(roomToken).emit('transcription:new_segment', {
                id: transcription.id,
                sessionId: transcription.sessionId,
                text: transcription.text,
                speakerTag: transcription.speakerTag,
                startMs: transcription.startMs,
                dialect: transcription.dialect,
                createdAt: transcription.createdAt,
              });
            }
          } catch (err) {
            logger.error('Failed to persist realtime final', { err, sessionId: session.id });
            socket.emit('transcribe:error', { message: 'Failed to save transcription' });
          }
        },
        onError: (message) => {
          socket.emit('transcribe:error', { message });
        },
        onClose: () => {
          socket.emit('transcribe:closed');
        },
      });

      rt = {
        conn,
        sessionId: session.id,
        dialect,
        hospitalId: session.hospitalId,
        userId: claims.userId,
        speakerTag: 'DOCTOR',
        recordingStartedAt,
        roomToken,
      };
      logger.info('[STT] opening upstream OpenAI Realtime WS', { sessionId: session.id, dialect });
      conn.open();
      socket.emit('transcribe:ready');
      logger.info('[STT] transcribe:ready emitted to client');
    } catch (err) {
      logger.warn('transcribe:start failed', { err: (err as Error).message });
      socket.emit('transcribe:error', { message: 'Failed to start transcription' });
    }
  });

  // Audio frames arrive as raw binary (Buffer in node). Forward as base64
  // PCM16 to OpenAI. The browser is responsible for encoding to PCM16 24kHz
  // mono before sending.
  let audioFrameCount = 0;
  socket.on('transcribe:audio', (chunk: ArrayBuffer | Buffer) => {
    if (!rt) {
      if (audioFrameCount === 0) {
        logger.warn('[STT] transcribe:audio received but no rt context — was start emitted?');
      }
      return;
    }
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    if (buf.length === 0) return;
    audioFrameCount++;
    if (audioFrameCount === 1 || audioFrameCount % 50 === 0) {
      logger.info('[STT] audio frames forwarded', { count: audioFrameCount, lastBytes: buf.length });
    }
    rt.conn.appendAudio(buf.toString('base64'));
  });

  socket.on('transcribe:stop', () => {
    teardown();
  });

  socket.on('disconnect', () => {
    teardown();
    logger.debug('Socket disconnected', { socketId: socket.id });
  });
};
