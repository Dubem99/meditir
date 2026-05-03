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

const dialectToLanguage: Record<Dialect, string> = {
  NIGERIAN_ENGLISH: 'en',
  YORUBA_ACCENTED: 'yo',
  HAUSA_ACCENTED: 'ha',
  IGBO_ACCENTED: 'ig',
};

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
  private dialect: Dialect;
  private cb: RealtimeCallbacks;
  private finalStartedAt: number = 0;
  private currentItemId: string | null = null;
  // Buffer audio that arrives before the upstream socket is ready, then
  // flush once it opens.
  private pendingAudioFrames: string[] = [];

  constructor(dialect: Dialect, cb: RealtimeCallbacks) {
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

      // Configure the session: enable transcription with our chosen model
      // and language hint, plus server-side VAD so OpenAI auto-segments
      // speech into individual transcribable utterances.
      this.send({
        type: 'transcription_session.update',
        session: {
          input_audio_format: 'pcm16',
          input_audio_transcription: {
            model: config.OPENAI_TRANSCRIBE_MODEL,
            language: dialectToLanguage[this.dialect] ?? 'en',
          },
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
      logger.warn('OpenAI Realtime WS error', { message: err.message });
      this.cb.onError(`Upstream STT error: ${err.message}`);
    });

    ws.on('close', (code, reason) => {
      this.closed = true;
      logger.debug('OpenAI Realtime WS closed', { code, reason: reason.toString() });
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

    switch (type) {
      // Streaming partial transcript. Each delta is appended to the current
      // utterance — the doctor sees text fill in word-by-word.
      case 'conversation.item.input_audio_transcription.delta': {
        const delta = (msg.delta as string) ?? '';
        const itemId = (msg.item_id as string) ?? null;
        if (this.currentItemId !== itemId) {
          this.currentItemId = itemId;
          this.finalStartedAt = Date.now();
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
