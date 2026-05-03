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
// supported way to nudge recognition toward specific terms — particularly
// useful for medical jargon and Nigerian-specific drug names that the model
// otherwise mis-hears (e.g. "Coartem" → "core item").
const NIGERIAN_MEDICAL_VOCAB = [
  // Common labs / tests
  'FBC', 'PCV', 'ESR', 'WBC', 'MP', 'BF', 'RDT', 'RBS', 'FBS', 'HbA1c', '2HPP',
  'LFT', 'E/U/Cr', 'Urinalysis', 'HVS', 'PSA', 'HBsAg', 'HCV', 'VDRL', 'RVS',
  'ECG', 'CXR', 'USS', 'CT', 'MRI',
  // Drugs commonly prescribed in Nigeria
  'Paracetamol', 'Amoxicillin', 'Augmentin', 'Ciprofloxacin', 'Metronidazole',
  'Artemether-lumefantrine', 'Coartem', 'Lonart', 'Amalar', 'Sulfadoxine-pyrimethamine',
  'Folic acid', 'Ferrous sulphate', 'Ranferon', 'ORS', 'Oral rehydration solution',
  'Lisinopril', 'Amlodipine', 'Hydrochlorothiazide', 'Methyldopa', 'Aldomet',
  'Metformin', 'Glibenclamide', 'Insulin',
  // Conditions / dx
  'Plasmodium falciparum', 'Malaria parasite', 'Sickle cell', 'HbSS', 'HbAS',
  'Hypertension', 'Diabetes mellitus', 'Pneumonia', 'Otitis media', 'URTI',
  'Gastroenteritis', 'Typhoid', 'Tuberculosis', 'HIV',
  // Antenatal / paeds
  'Antenatal', 'IPTp', 'Tetanus toxoid', 'Booking visit', 'Fundal height',
  'Fetal heart rate', 'Gestational age', 'EDD', 'LMP', 'G2P1', 'Meconium',
  // Common Nigerian healthcare phrases
  'Pikin', 'Wahala', 'Pain dey', 'NHIA', 'NHIS', 'HMO',
].join(', ');

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

    const ws = new WebSocket(OPENAI_REALTIME_URL, {
      headers: {
        Authorization: `Bearer ${config.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1',
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
        // Bias recognition toward Nigerian medical vocabulary. This is the
        // OpenAI-supported way to nudge the model on domain-specific terms
        // and noticeably improves drug/condition names that would otherwise
        // be mis-heard.
        prompt: NIGERIAN_MEDICAL_VOCAB,
      };
      // Send a language hint when we have one. PIDGIN and AUTO_DETECT both
      // fall through to OpenAI's per-utterance language detection.
      if (this.dialect !== AUTO_DETECT_DIALECT && this.dialect !== 'PIDGIN') {
        const code = dialectToLanguage[this.dialect as Dialect];
        if (code) transcription.language = code;
      }
      this.send({
        type: 'transcription_session.update',
        session: {
          input_audio_format: 'pcm16',
          input_audio_transcription: transcription,
          // Server VAD chunks utterances based on silence — gives us natural
          // sentence-level finals while still streaming partial deltas.
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 600,
          },
          input_audio_noise_reduction: { type: 'near_field' },
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
        break;
      }

      case 'conversation.item.input_audio_transcription.failed': {
        const error = (msg.error as { message?: string } | undefined)?.message ?? 'transcription failed';
        this.cb.onError(error);
        break;
      }

      case 'error': {
        const err = (msg.error as { message?: string } | undefined)?.message ?? 'OpenAI realtime error';
        this.cb.onError(err);
        break;
      }

      default:
        // Other event types (session.created, session.updated, etc.) — ignore
        break;
    }
  }
}
