'use client';

import { useRef, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Dialect, Transcription } from '@/types/entities.types';

// Emitted by the recorder. `transcription` is the saved row from the
// /transcriptions/stream endpoint (already persisted server-side). When
// `isFinal` is false, `text` is interim display-only — currently unused
// since gpt-4o-transcribe doesn't stream interim chunks per buffer flush.
export interface TranscriptSegment {
  text: string;
  isFinal: boolean;
  transcription?: Transcription;
}

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  startRecording: (onSegment: (segment: TranscriptSegment) => void) => void;
  stopRecording: () => void;
  error: string | null;
  isSupported: boolean;
}

interface AudioRecorderOptions {
  sessionId: string;
  // Chunk duration in ms. 5-10s gives a reasonable trade-off between latency
  // (lower = faster on-screen feedback) and STT cost+quality (higher =
  // fewer API calls + more context for the model).
  chunkMs?: number;
}

const DEFAULT_CHUNK_MS = 7000;

const pickMimeType = (): string => {
  if (typeof window === 'undefined') return 'audio/webm';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  const MR = (window as typeof window & { MediaRecorder?: typeof MediaRecorder }).MediaRecorder;
  if (!MR || typeof MR.isTypeSupported !== 'function') return 'audio/webm';
  for (const c of candidates) {
    try {
      if (MR.isTypeSupported(c)) return c;
    } catch {
      // ignore — Safari historically threw on some inputs
    }
  }
  return 'audio/webm';
};

export const useAudioRecorder = (
  dialect: Dialect = 'NIGERIAN_ENGLISH',
  options?: AudioRecorderOptions
): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunkBufRef = useRef<Blob[]>([]);
  // Wall-clock anchor for the recording session. All `startMs` values sent to
  // the server are OFFSETS from this anchor, not Unix timestamps. The
  // Transcription.startMs column is INT4 (~2.1B max) so absolute timestamps
  // would overflow.
  const recordingStartedAtRef = useRef<number>(0);
  const chunkStartMsRef = useRef<number>(0);
  const onSegmentRef = useRef<(segment: TranscriptSegment) => void>(() => {});
  const stopRequestedRef = useRef(false);
  const dialectRef = useRef<Dialect>(dialect);
  dialectRef.current = dialect;

  const isSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getUserMedia' in navigator.mediaDevices &&
    typeof (window as typeof window & { MediaRecorder?: typeof MediaRecorder }).MediaRecorder !== 'undefined';

  const flushChunkToServer = useCallback(
    async (blob: Blob, chunkStartedAt: number) => {
      if (!options?.sessionId) return;
      if (blob.size === 0) return;

      // startMs in the schema is the OFFSET from the start of recording.
      // Sending an absolute Date.now() value overflows the INT4 column.
      const offsetMs = Math.max(
        0,
        chunkStartedAt - (recordingStartedAtRef.current || chunkStartedAt)
      );

      const form = new FormData();
      const mime = blob.type || 'audio/webm';
      const ext = mime.includes('mp4') ? 'mp4' : mime.includes('ogg') ? 'ogg' : 'webm';
      form.append('audio', blob, `chunk-${offsetMs}.${ext}`);
      form.append('sessionId', options.sessionId);
      form.append('dialect', dialectRef.current);
      form.append('startMs', String(offsetMs));
      form.append('speakerTag', 'DOCTOR');

      try {
        const res = await api.post('/transcriptions/stream', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const data: Transcription | null = res.data?.data ?? null;
        // data === null when the chunk transcribed to empty (e.g. silence).
        // Skip emitting in that case to avoid showing empty rows.
        if (data && data.text) {
          onSegmentRef.current({ text: data.text, isFinal: true, transcription: data });
        }
      } catch (err) {
        const e = err as { response?: { data?: { message?: string }; status?: number }; message?: string };
        const msg = e?.response?.data?.message ?? e?.message ?? 'Transcription failed';
        setError(`STT error: ${msg}`);
      }
    },
    [options?.sessionId]
  );

  const startRecording = useCallback(
    async (onSegment: (segment: TranscriptSegment) => void) => {
      if (!isSupported) {
        setError('Audio recording is not supported in this browser. Use Chrome, Edge, Safari, or Firefox.');
        return;
      }
      if (!options?.sessionId) {
        setError('Missing sessionId — cannot start transcription.');
        return;
      }
      onSegmentRef.current = onSegment;
      stopRequestedRef.current = false;
      setError(null);

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch (err) {
        const e = err as { name?: string; message?: string };
        if (e?.name === 'NotAllowedError') {
          setError('Microphone access denied — grant permission in your browser settings.');
        } else {
          setError(`Could not access microphone: ${e?.message ?? 'unknown error'}`);
        }
        return;
      }
      streamRef.current = stream;

      const mimeType = pickMimeType();
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, { mimeType });
      } catch {
        recorder = new MediaRecorder(stream); // fall back to default
      }
      recorderRef.current = recorder;

      // We rely on `timeslice` to fire dataavailable per chunk. When the chunk
      // arrives, we ship it to the server and reset the buffer. This way each
      // network call carries exactly one chunk's worth of audio.
      recorder.addEventListener('dataavailable', (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunkBufRef.current.push(event.data);
        }
      });

      const chunkMs = options.chunkMs ?? DEFAULT_CHUNK_MS;
      // Anchor the session — chunk offsets are computed relative to this.
      recordingStartedAtRef.current = Date.now();
      let chunkStart = Date.now();
      chunkStartMsRef.current = chunkStart;

      // The standard MediaRecorder API doesn't natively split into discrete
      // chunks for our use case — `timeslice` produces fragments that aren't
      // independently decodable for codecs like Opus-in-WebM. So we
      // periodically stop+restart the recorder to produce self-contained
      // playable chunks.
      const restartInterval = setInterval(() => {
        if (stopRequestedRef.current) return;
        if (recorder.state !== 'recording') return;
        recorder.stop();
        // restart after the dataavailable + stop event fire
        setTimeout(() => {
          if (stopRequestedRef.current || !streamRef.current) return;
          try {
            const newRecorder = new MediaRecorder(streamRef.current, { mimeType });
            recorderRef.current = newRecorder;
            newRecorder.addEventListener('dataavailable', (event: BlobEvent) => {
              if (event.data && event.data.size > 0) chunkBufRef.current.push(event.data);
            });
            newRecorder.addEventListener('stop', handleStop);
            newRecorder.start();
          } catch {
            // recovery failed — surface error and stop
            setError('Recording interrupted. Click record again to resume.');
            stopRequestedRef.current = true;
          }
        }, 50);
      }, chunkMs);

      const handleStop = () => {
        const blob = new Blob(chunkBufRef.current, { type: mimeType });
        const startedAt = chunkStart;
        chunkBufRef.current = [];
        chunkStart = Date.now();
        chunkStartMsRef.current = chunkStart;
        // Fire and forget — we don't block the next chunk's recording on STT.
        void flushChunkToServer(blob, startedAt);

        if (stopRequestedRef.current) {
          clearInterval(restartInterval);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }
          recorderRef.current = null;
          setIsRecording(false);
        }
      };
      recorder.addEventListener('stop', handleStop);

      recorder.start();
      setIsRecording(true);
    },
    [isSupported, options, flushChunkToServer]
  );

  const stopRecording = useCallback(() => {
    stopRequestedRef.current = true;
    const r = recorderRef.current;
    if (r && r.state !== 'inactive') {
      try { r.stop(); } catch { /* ignore */ }
    } else {
      // No active recorder — clean up stream directly
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setIsRecording(false);
    }
  }, []);

  return { isRecording, startRecording, stopRecording, error, isSupported };
};
