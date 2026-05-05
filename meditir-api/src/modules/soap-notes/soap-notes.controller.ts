import { Request, Response } from 'express';
import * as service from './soap-notes.service';
import * as ttsService from '../tts/tts.service';
import { param, hospitalId } from '../../utils/params';
import { AppError } from '../../utils/AppError';
import { prisma } from '../../config/database';

export const listMyNotes = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const notes = await service.listPatientNotes(req.user.id, hospitalId(req));
  res.json({ status: 'success', data: notes });
};

export const generate = async (req: Request, res: Response): Promise<void> => {
  const note = await service.generateSOAPNote(req.body.sessionId, hospitalId(req));
  res.status(201).json({ status: 'success', data: note });
};

// NDJSON stream — every line is a single JSON event:
//   {"type":"delta","text":"..."}      — Claude text chunk
//   {"type":"done","note":{...}}       — final persisted note
//   {"type":"error","message":"..."}   — generation failed mid-stream
//
// Pre-stream errors (auth, missing session, empty transcript, finalized note)
// fail with a normal HTTP status before any body is written. Mid-stream errors
// land as a final {type:"error"} event so the client can surface them in the
// already-open progressive UI.
export const streamGenerate = async (req: Request, res: Response): Promise<void> => {
  const sessionId = param(req, 'sessionId');
  const hid = hospitalId(req);

  // Headers must be sent before any error to make this an NDJSON response,
  // but we want pre-stream errors (404 / 400) to surface as proper HTTP
  // statuses. So we kick off the generator first and only flush headers once
  // it yields its first event without throwing.
  const generator = service.streamSOAPNote(sessionId, hid);
  let headersFlushed = false;

  try {
    for await (const event of generator) {
      if (!headersFlushed) {
        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
        headersFlushed = true;
      }
      res.write(JSON.stringify(event) + '\n');
    }
    res.end();
  } catch (err: unknown) {
    const e = err as { message?: string; statusCode?: number };
    if (!headersFlushed) {
      // Pre-stream failure — surface as normal AppError so the global handler
      // formats it with the right status code.
      throw err;
    }
    // Mid-stream failure — close out the NDJSON stream with an error event.
    const message = e?.message ?? 'Note generation failed';
    // Persist on session so a refresh sees the same error.
    await prisma.consultationSession
      .update({ where: { id: sessionId }, data: { noteGenerationError: message.slice(0, 500) } })
      .catch(() => {});
    res.write(JSON.stringify({ type: 'error', message }) + '\n');
    res.end();
  }
};

export const get = async (req: Request, res: Response): Promise<void> => {
  const note = await service.getSOAPNote(param(req, 'id'), hospitalId(req));
  res.json({ status: 'success', data: note });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const note = await service.updateSOAPNote(param(req, 'id'), hospitalId(req), req.user.id, req.body);
  res.json({ status: 'success', data: note });
};

export const finalize = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const note = await service.finalizeSOAPNote(param(req, 'id'), hospitalId(req), req.user.id);
  res.json({ status: 'success', data: note });
};

export const transfer = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) throw new AppError('Authentication required', 401);
  const result = await service.transferSoapNoteToRecords(
    param(req, 'id'),
    hospitalId(req),
    req.user.id
  );
  res.json({ status: 'success', data: result });
};

export const getTTS = async (req: Request, res: Response): Promise<void> => {
  const noteId = param(req, 'id');
  const note = await service.getSOAPNote(noteId, hospitalId(req));

  if (note.ttsAudioUrl) {
    res.json({ status: 'success', data: { audioUrl: note.ttsAudioUrl, cached: true } });
    return;
  }

  const summary = `Patient Summary:\n${note.subjective}\n\nAssessment: ${note.assessment}\n\nPlan: ${note.plan}`;
  const audioUrl = await ttsService.generateTTSAudio(summary, req.user?.id || 'system');

  await prisma.sOAPNote.update({
    where: { id: note.id },
    data: { ttsAudioUrl: audioUrl, ttsGeneratedAt: new Date() },
  });

  res.json({ status: 'success', data: { audioUrl, cached: false } });
};
