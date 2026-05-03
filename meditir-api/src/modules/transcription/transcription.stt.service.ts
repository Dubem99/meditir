import OpenAI, { toFile } from 'openai';
import { config } from '../../config';
import { AppError } from '../../utils/AppError';
import { Dialect } from '../../types/enums';
import { logger } from '../../utils/logger';

// Server-side STT bridge to OpenAI gpt-4o-transcribe.
//
// Architecture A (Phase 1): audio is passed through ephemerally. Nothing is
// retained on Meditir's side after the API responds. OpenAI's API terms
// commit to no training on API audio + no retention beyond processing.
//
// The dialect dropdown finally has wired-up effect — it sets the language
// hint sent to OpenAI, which materially improves accuracy on Yoruba / Hausa /
// Igbo by skipping the auto-detect step that often locks onto English.

let client: OpenAI | null = null;
const getClient = (): OpenAI => {
  if (!config.OPENAI_API_KEY) {
    throw new AppError('STT not configured (OPENAI_API_KEY missing)', 503);
  }
  if (!client) client = new OpenAI({ apiKey: config.OPENAI_API_KEY });
  return client;
};

// Whisper / gpt-4o-transcribe accepts ISO-639-1 language codes for the
// `language` parameter. Maps Meditir's Dialect enum to those codes.
//
// Notes:
// - 'en' covers Nigerian English subsumed under Whisper's English training.
// - Pidgin doesn't have its own ISO code in OpenAI's accepted set, so we pass
//   'en' and let the model do its best (Pidgin is closer to English than to
//   the major Nigerian languages).
// - Yoruba ('yo'), Hausa ('ha'), Igbo ('ig') are all in OpenAI's supported
//   language list. Igbo coverage is weakest but still better than auto-detect.
const dialectToLanguage: Record<Dialect, string> = {
  NIGERIAN_ENGLISH: 'en',
  YORUBA_ACCENTED: 'yo',
  HAUSA_ACCENTED: 'ha',
  IGBO_ACCENTED: 'ig',
};

export interface TranscribeResult {
  text: string;
  language: string;
  durationMs: number;
}

const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // OpenAI's 25 MB limit

export const transcribeAudioChunk = async (
  audioBuffer: Buffer,
  dialect: Dialect,
  filename = 'chunk.webm'
): Promise<TranscribeResult> => {
  if (!audioBuffer || audioBuffer.length === 0) {
    throw new AppError('Empty audio chunk', 400);
  }
  if (audioBuffer.length > MAX_AUDIO_BYTES) {
    throw new AppError(`Audio chunk exceeds 25 MB limit`, 413);
  }

  const language = dialectToLanguage[dialect] ?? 'en';
  const start = Date.now();

  try {
    // toFile constructs a File-like object that OpenAI's SDK accepts as
    // multipart upload. Filename extension hints at format (.webm, .mp4, .wav).
    const file = await toFile(audioBuffer, filename, { type: 'audio/webm' });

    const response = await getClient().audio.transcriptions.create({
      file,
      model: config.OPENAI_TRANSCRIBE_MODEL,
      language,
      // Plain text output is faster than verbose-JSON and we don't need
      // word-level timestamps in Phase 1.
      response_format: 'text',
    });

    const text = typeof response === 'string' ? response : (response as { text?: string }).text ?? '';

    return {
      text: text.trim(),
      language,
      durationMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string; code?: string };
    logger.error('STT request failed', {
      status: e.status,
      code: e.code,
      message: e.message,
      dialect,
      bytes: audioBuffer.length,
    });

    // Surface OpenAI errors as actionable 502s to the client rather than
    // generic 500s. Doctor needs to know if it's their connection vs upstream.
    if (e.status === 401) throw new AppError('STT auth failed (server config)', 502);
    if (e.status === 429) throw new AppError('STT rate limited — retry shortly', 502);
    if (e.status && e.status >= 500) throw new AppError('STT upstream temporarily unavailable', 502);
    throw new AppError(`STT failed: ${e.message ?? 'unknown error'}`, 502);
  }
};
