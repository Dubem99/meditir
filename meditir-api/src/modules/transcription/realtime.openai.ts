import WebSocket from 'ws';
import { config } from '../../config';
import { Dialect } from '../../types/enums';
import { logger } from '../../utils/logger';

// One per-client connection to OpenAI's Realtime API in transcription-only
// mode. The browser opens a socket.io session; for each "transcribe:start"
// we spin up one of these and bridge audio in / transcripts out.
//
// Docs: https://platform.openai.com/docs/guides/realtime-transcription
//
// Audio format expected by OpenAI: PCM16 mono at 24 kHz, base64-encoded
// per `input_audio_buffer.append` frame.

const OPENAI_REALTIME_URL = 'wss://api.openai.com/v1/realtime?intent=transcription';

// Maps each dialect to the ISO-639-1 hint we send to OpenAI's
// transcription_session.update. PIDGIN intentionally omits a hint (handled
// separately below) — Whisper has no Pidgin language code, and forcing
// 'en' for Pidgin garbles distinctively non-English Pidgin grammar. Letting
// the model auto-detect per utterance gives better results.
const dialectToLanguage: Partial<Record<Dialect, string>> = {
  ENGLISH: 'en',
  NIGERIAN_ENGLISH: 'en', // legacy
  YORUBA_ACCENTED: 'yo',
  HAUSA_ACCENTED: 'ha',
  IGBO_ACCENTED: 'ig',
  // PIDGIN: deliberately not mapped — falls through to auto-detect.
};

// Vocabulary-biasing prompt sent to gpt-4o-transcribe via the `prompt` field
// in transcription_session.update.input_audio_transcription. This is OpenAI's
// supported way to nudge recognition toward specific terms.
//
// Two separate lists, picked per session based on language:
//
//   UNIVERSAL — terms doctors say identically in any language: drug brand
//   names, lab abbreviations, internationally-shared medical terminology.
//   Even when consultations are in Yoruba/Hausa/Igbo, doctors still say
//   "FBC", "Coartem", "malaria" in English. This list helps every language.
//
//   ENGLISH_PHRASES — Nigerian-English & Pidgin specific phrasing. Mixing
//   this into a Yoruba/Hausa/Igbo session would bias the model toward
//   English-sounding interpretations of non-English audio, hurting
//   accuracy. Sent only for ENGLISH or PIDGIN sessions.
const UNIVERSAL_MEDICAL_VOCAB = [
  // Lab abbreviations — said in English universally
  'FBC', 'PCV', 'ESR', 'WBC', 'MP', 'BF', 'RDT', 'RBS', 'FBS', 'HbA1c', '2HPP',
  'LFT', 'E/U/Cr', 'Urinalysis', 'HVS', 'PSA', 'HBsAg', 'HCV', 'VDRL', 'RVS',
  'ECG', 'CXR', 'USS', 'CT', 'MRI',
  // Drug brand names — said identically in any language
  'Paracetamol', 'Amoxicillin', 'Augmentin', 'Ciprofloxacin', 'Metronidazole',
  'Artemether-lumefantrine', 'Coartem', 'Lonart', 'Amalar',
  'Sulfadoxine-pyrimethamine', 'Folic acid', 'Ferrous sulphate', 'Ranferon',
  'ORS', 'Lisinopril', 'Amlodipine', 'Hydrochlorothiazide', 'Methyldopa',
  'Aldomet', 'Metformin', 'Glibenclamide', 'Insulin',
  // International medical terms — also said in English in code-switched visits
  'Plasmodium falciparum', 'malaria parasite', 'sickle cell', 'HbSS', 'HbAS',
  'hypertension', 'diabetes mellitus', 'pneumonia', 'otitis media', 'URTI',
  'gastroenteritis', 'typhoid', 'tuberculosis', 'HIV',
  'antenatal', 'IPTp', 'tetanus toxoid', 'fundal height', 'fetal heart rate',
  'gestational age', 'EDD', 'LMP', 'G2P1', 'meconium',
  // System / billing context
  'NHIA', 'NHIS', 'HMO',
].join(', ');

const ENGLISH_PHRASES = [
  'oral rehydration solution', 'booking visit',
  'pikin', 'wahala', 'pain dey', 'belle dey worry me',
].join(', ');

const buildVocabPrompt = (dialect: DialectInput): string => {
  if (dialect === 'ENGLISH' || dialect === 'PIDGIN') {
    return `${UNIVERSAL_MEDICAL_VOCAB}. ${ENGLISH_PHRASES}.`;
  }
  // For Yoruba / Hausa / Igbo / Auto-detect: only universal terms. Avoids
  // biasing the model toward English when the audio is in another language.
  return UNIVERSAL_MEDICAL_VOCAB;
};

// Synthetic value sent by the browser when the doctor picks "Auto-detect" —
// we omit the language hint so OpenAI's model auto-detects per utterance.
export const AUTO_DETECT_DIALECT = 'AUTO_DETECT';
export type DialectInput = Dialect | typeof AUTO_DETECT_DIALECT;

export interface RealtimeCallbacks {
  onPartial: (text: string) => void;
  onFinal: (text: string, durationMs: number) => void;
  onError: (message: string) => void;
  onClose: () => void;
}

export class OpenAIRealtimeConnection {
  private ws: WebSocket | null = null;
  private opened = false;
  private closed = false;
  private dialect: DialectInput;
  private cb: RealtimeCallbacks;
  private finalStartedAt: number = 0;
  private currentItemId: string | null = null;
  // Buffer audio that arrives before the upstream socket is ready, then
  // flush once it opens.
  private pendingAudioFrames: string[] = [];
  // Resolver for an in-flight flush() call. Resolved when the next
  // `.completed` or `input_audio_buffer.committed` event arrives, or when
  // the flush timeout fires.
  private flushResolve: (() => void) | null = null;

  constructor(dialect: DialectInput, cb: RealtimeCallbacks) {
    this.dialect = dialect;
    this.cb = cb;
  }

  open(): void {
    if (!config.OPENAI_API_KEY) {
      this.cb.onError('STT not configured (OPENAI_API_KEY missing)');
      this.cb.onClose();
      return;
    }

    // GA Realtime API: the `OpenAI-Beta: realtime=v1` header is gone. Sending
    // it now forces the retired beta protocol and OpenAI rejects the session
    // with "The Realtime Beta API is no longer supported."
    const ws = new WebSocket(OPENAI_REALTIME_URL, {
      headers: {
        Authorization: `Bearer ${config.OPENAI_API_KEY}`,
      },
    });
    this.ws = ws;

    ws.on('open', () => {
      this.opened = true;
      logger.info('[STT] upstream OpenAI WS open', { dialect: this.dialect });

      // Configure the session: enable transcription with our chosen model
      // and language hint, plus server-side VAD so OpenAI auto-segments
      // speech into individual transcribable utterances.
      //
      // For AUTO_DETECT we omit `language` entirely — OpenAI then runs its
      // language-detection on each utterance. Costs a small accuracy hit on
      // low-resource African languages but handles code-switching well.
      const transcription: { model: string; language?: string; prompt?: string } = {
        model: config.OPENAI_TRANSCRIBE_MODEL,
        // Vocabulary biasing — language-aware so we don't drag a Yoruba
        // session toward English-sounding interpretations.
        prompt: buildVocabPrompt(this.dialect),
      };
      // Send a language hint when we have one. PIDGIN and AUTO_DETECT both
      // fall through to OpenAI's per-utterance language detection.
      if (this.dialect !== AUTO_DETECT_DIALECT && this.dialect !== 'PIDGIN') {
        const code = dialectToLanguage[this.dialect as Dialect];
        if (code) transcription.language = code;
      }
      // GA shape: a single `session.update` with `session.type:"transcription"`.
      // Audio settings move under `session.audio.input.*`, and the format is
      // now an object (`audio/pcm` @ 24 kHz) instead of the string 'pcm16'.
      this.send({
        type: 'session.update',
        session: {
          type: 'transcription',
          audio: {
            input: {
              format: { type: 'audio/pcm', rate: 24000 },
              transcription,
              // Server VAD chunks utterances based on silence — gives us
              // natural sentence-level finals while still streaming partials.
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 600,
              },
              noise_reduction: { type: 'near_field' },
            },
          },
        },
      });

      // Flush any audio that arrived while we were still connecting.
      for (const frame of this.pendingAudioFrames) {
        this.send({ type: 'input_audio_buffer.append', audio: frame });
      }
      this.pendingAudioFrames = [];
    });

    ws.on('message', (raw: WebSocket.RawData) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      this.handleEvent(msg);
    });

    ws.on('error', (err: Error) => {
      logger.error('[STT] upstream OpenAI WS error', { message: err.message });
      this.cb.onError(`Upstream STT error: ${err.message}`);
    });

    ws.on('close', (code, reason) => {
      this.closed = true;
      logger.info('[STT] upstream OpenAI WS closed', { code, reason: reason.toString() });
      this.cb.onClose();
    });
  }

  /** Forward a base64-encoded PCM16 audio chunk to the upstream model. */
  appendAudio(pcm16Base64: string): void {
    if (this.closed) return;
    if (!this.opened) {
      // Buffer until 'open'
      if (this.pendingAudioFrames.length < 200) {
        this.pendingAudioFrames.push(pcm16Base64);
      }
      return;
    }
    this.send({ type: 'input_audio_buffer.append', audio: pcm16Base64 });
  }

  close(): void {
    this.closed = true;
    if (this.ws && this.ws.readyState <= 1) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
    }
    this.ws = null;
  }

  /**
   * Force OpenAI to commit whatever audio is currently buffered as a complete
   * utterance, instead of waiting for server-VAD silence detection.
   *
   * Without this, when the doctor pauses or ends recording mid-sentence, the
   * server-VAD threshold (silence_duration_ms = 600) never fires, the partial
   * utterance never produces a `.completed` event, and the transcript text
   * the doctor saw streaming as `onPartial` is silently dropped — never
   * persisted to the DB, so SOAP generation rejects the session as empty.
   *
   * Resolves when either the resulting `.completed` event arrives (so the
   * onFinal callback has run + persisted), the buffer-was-empty error arrives
   * (no audio to commit, common case for instant-stop), or the timeout fires.
   * Safe to call multiple times — only one flush is in flight at any moment.
   */
  flush(timeoutMs = 3000): Promise<void> {
    if (!this.opened || this.closed || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return Promise.resolve();
    }
    // If there's already a pending flush, just wait on it — concurrent
    // flushes would race their resolvers.
    if (this.flushResolve) {
      return new Promise((resolve) => {
        const prior = this.flushResolve!;
        this.flushResolve = () => { prior(); resolve(); };
      });
    }
    return new Promise<void>((resolve) => {
      this.flushResolve = resolve;
      const timer = setTimeout(() => {
        if (this.flushResolve === resolve) {
          this.flushResolve = null;
          resolve();
        }
      }, timeoutMs);
      // Best-effort cleanup if resolved before timeout fires.
      const wrapped = resolve;
      this.flushResolve = () => { clearTimeout(timer); wrapped(); };
      this.send({ type: 'input_audio_buffer.commit' });
    });
  }

  /** Commit any buffered audio, wait for the resulting final, then close. */
  async closeAfterFlush(timeoutMs = 3000): Promise<void> {
    try { await this.flush(timeoutMs); } catch {}
    this.close();
  }

  private send(payload: Record<string, unknown>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    try {
      this.ws.send(JSON.stringify(payload));
    } catch (err) {
      logger.warn('Failed to send to OpenAI Realtime', { err: (err as Error).message });
    }
  }

  private handleEvent(msg: Record<string, unknown>): void {
    const type = msg.type as string | undefined;
    if (!type) return;

    // Log everything except high-frequency delta events for visibility.
    if (type !== 'conversation.item.input_audio_transcription.delta') {
      logger.info('[STT] upstream event', {
        type,
        // Include error details and any other interesting fields verbatim.
        snapshot: JSON.stringify(msg).slice(0, 800),
      });
    }

    switch (type) {
      // Streaming partial transcript. Each delta is appended to the current
      // utterance — the doctor sees text fill in word-by-word.
      case 'conversation.item.input_audio_transcription.delta': {
        const delta = (msg.delta as string) ?? '';
        const itemId = (msg.item_id as string) ?? null;
        if (this.currentItemId !== itemId) {
          this.currentItemId = itemId;
          this.finalStartedAt = Date.now();
          logger.info('[STT] new utterance starting', { itemId });
        }
        if (delta) this.cb.onPartial(delta);
        break;
      }

      // Utterance complete. The full transcript for this segment is in
      // `transcript`. Save it as a Transcription row + emit to the room.
      case 'conversation.item.input_audio_transcription.completed': {
        const text = ((msg.transcript as string) ?? '').trim();
        const durationMs = this.finalStartedAt > 0 ? Date.now() - this.finalStartedAt : 0;
        this.currentItemId = null;
        this.finalStartedAt = 0;
        if (text) this.cb.onFinal(text, durationMs);
        // A pending flush() is satisfied — the partial-utterance commit it
        // requested has now produced its final transcript and been persisted
        // by onFinal. Safe for the caller to close the WS.
        this.resolveFlush();
        break;
      }

      // Acknowledgement of an explicit `input_audio_buffer.commit`. Arrives
      // before `.completed` (or instead of it, for a buffer that contained
      // no speech). Either way, flush() can resolve as soon as we hear this
      // acknowledgement — the audio is no longer pending in OpenAI.
      case 'input_audio_buffer.committed': {
        this.resolveFlush();
        break;
      }

      case 'conversation.item.input_audio_transcription.failed': {
        const error = (msg.error as { message?: string } | undefined)?.message ?? 'transcription failed';
        this.cb.onError(error);
        this.resolveFlush();
        break;
      }

      case 'error': {
        const err = msg.error as { message?: string; code?: string } | undefined;
        // `input_audio_buffer_commit_empty` is the expected response when we
        // explicitly commit a buffer that had no audio (e.g. doctor hit stop
        // immediately after start with no speech). Don't surface it to the
        // doctor — just unblock any pending flush.
        if (err?.code === 'input_audio_buffer_commit_empty') {
          this.resolveFlush();
          break;
        }
        this.cb.onError(err?.message ?? 'OpenAI realtime error');
        this.resolveFlush();
        break;
      }

      default:
        // Other event types (session.created, session.updated, etc.) — ignore
        break;
    }
  }

  private resolveFlush(): void {
    if (this.flushResolve) {
      const r = this.flushResolve;
      this.flushResolve = null;
      r();
    }
  }
}
