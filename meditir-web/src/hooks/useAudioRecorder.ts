'use client';

import { useRef, useState, useCallback } from 'react';
import { getSocket, connectSocket } from '@/lib/socket';
import { getAccessToken } from '@/lib/api';
import type { Dialect, Transcription } from '@/types/entities.types';

// Realtime STT recorder. Captures microphone audio at 24kHz mono via
// AudioWorklet, ships PCM16 frames to the server over socket.io. The server
// proxies to OpenAI's Realtime Transcription API and emits back streaming
// partial transcripts (word-by-word feel) plus a saved Transcription row
// when each utterance completes.
//
// Pause/resume design: pause RELEASES the microphone (mic LED off, patient-
// visible privacy signal). Resume re-acquires. The OpenAI WS stays open
// across pauses so resume is instant. Audio level meter pulses while
// recording for clinician confidence.

export interface TranscriptSegment {
  text: string;
  isFinal: boolean;
  transcription?: Transcription;
}

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  // 0..1 RMS level updated ~30x/sec while recording; 0 while paused.
  audioLevel: number;
  startRecording: (onSegment: (segment: TranscriptSegment) => void) => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  stopRecording: () => void;
  error: string | null;
  isSupported: boolean;
}

interface AudioRecorderOptions {
  sessionId: string;
}

const TARGET_SAMPLE_RATE = 24_000;

export const useAudioRecorder = (
  dialect: Dialect = 'NIGERIAN_ENGLISH',
  options?: AudioRecorderOptions
): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelRafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onSegmentRef = useRef<(segment: TranscriptSegment) => void>(() => {});
  const dialectRef = useRef<Dialect>(dialect);
  dialectRef.current = dialect;

  // Listeners attached during start, removed on stop.
  const partialListenerRef = useRef<((p: { text: string }) => void) | null>(null);
  const finalListenerRef = useRef<((p: { transcription: Transcription }) => void) | null>(null);
  const errorListenerRef = useRef<((p: { message: string }) => void) | null>(null);
  const readyListenerRef = useRef<(() => void) | null>(null);
  const closedListenerRef = useRef<(() => void) | null>(null);

  // Accumulates delta text across one utterance. Reset on final.
  const currentInterimRef = useRef<string>('');

  const isSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getUserMedia' in navigator.mediaDevices &&
    typeof (window as typeof window & { AudioContext?: typeof AudioContext }).AudioContext !== 'undefined';

  // ─── Mic chain (reusable across pause/resume) ──────────────────────

  const startLevelMeter = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const buf = new Uint8Array(analyser.fftSize);
    const tick = () => {
      if (!analyserRef.current) {
        levelRafRef.current = null;
        return;
      }
      analyserRef.current.getByteTimeDomainData(buf);
      // RMS over the time-domain buffer, normalised 0..1.
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      // Boost a bit so soft speech is visible — RMS rarely exceeds ~0.3 for voice.
      setAudioLevel(Math.min(1, rms * 3));
      levelRafRef.current = requestAnimationFrame(tick);
    };
    levelRafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopLevelMeter = useCallback(() => {
    if (levelRafRef.current != null) {
      cancelAnimationFrame(levelRafRef.current);
      levelRafRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const releaseMic = useCallback(() => {
    stopLevelMeter();
    if (workletRef.current) {
      try { workletRef.current.disconnect(); } catch { /* ignore */ }
      workletRef.current.port.onmessage = null;
      workletRef.current = null;
    }
    if (analyserRef.current) {
      try { analyserRef.current.disconnect(); } catch { /* ignore */ }
      analyserRef.current = null;
    }
    if (sourceRef.current) {
      try { sourceRef.current.disconnect(); } catch { /* ignore */ }
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      // Stopping all tracks turns off the mic LED — privacy signal to the
      // patient that audio is no longer being captured.
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, [stopLevelMeter]);

  // Acquires microphone, sets up the audio chain, starts forwarding PCM
  // frames to the server. Returns true on success, false on failure (with
  // setError already called).
  const acquireMic = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Audio recording is not supported in this browser. Use Chrome, Edge, Safari, or Firefox.');
      return false;
    }

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
      return false;
    }
    streamRef.current = stream;

    const Ctx = (window as typeof window & {
      AudioContext: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    }).AudioContext;
    const ctx = new Ctx({ sampleRate: TARGET_SAMPLE_RATE });
    audioContextRef.current = ctx;

    try {
      await ctx.audioWorklet.addModule('/pcm-worklet.js');
    } catch (err) {
      setError(`Failed to load audio worklet: ${(err as Error).message}`);
      releaseMic();
      return false;
    }

    const source = ctx.createMediaStreamSource(stream);
    sourceRef.current = source;

    // Analyser fans off from the source for the level meter — doesn't affect
    // what's sent to the worklet/server.
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.4;
    analyserRef.current = analyser;
    source.connect(analyser);

    const worklet = new AudioWorkletNode(ctx, 'pcm-worklet');
    workletRef.current = worklet;

    const sock = getSocket();
    worklet.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      if (sock.connected) sock.emit('transcribe:audio', event.data);
    };

    source.connect(worklet);
    startLevelMeter();
    return true;
  }, [isSupported, releaseMic, startLevelMeter]);

  // ─── Public API ────────────────────────────────────────────────────

  const startRecording = useCallback(
    async (onSegment: (segment: TranscriptSegment) => void) => {
      if (!options?.sessionId) {
        setError('Missing sessionId — cannot start transcription.');
        return;
      }
      const token = getAccessToken();
      if (!token) {
        setError('Not authenticated.');
        return;
      }

      onSegmentRef.current = onSegment;
      setError(null);

      // Wait for socket handshake — pre-connect emits don't always replay
      // reliably in the wild.
      const sock = connectSocket();
      if (!sock.connected) {
        try {
          await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => {
              sock.off('connect', onConnect);
              reject(new Error('Socket connection timed out after 8s'));
            }, 8000);
            const onConnect = () => {
              clearTimeout(timer);
              resolve();
            };
            sock.once('connect', onConnect);
          });
        } catch (err) {
          setError(`Could not connect: ${(err as Error).message}`);
          return;
        }
      }

      // Listeners — attached BEFORE we emit start so we don't miss events.
      const onPartial = ({ text: delta }: { text: string }) => {
        if (!delta) return;
        currentInterimRef.current += delta;
        onSegmentRef.current({ text: currentInterimRef.current, isFinal: false });
      };
      const onFinal = ({ transcription }: { transcription: Transcription }) => {
        currentInterimRef.current = '';
        if (transcription && transcription.text) {
          onSegmentRef.current({ text: transcription.text, isFinal: true, transcription });
        }
      };
      const onErrorEvt = ({ message }: { message: string }) => {
        setError(`STT error: ${message}`);
      };
      const onReady = () => { /* hook for future readiness UI */ };
      const onClosed = () => { /* upstream closed — keep mic until user stops */ };

      sock.on('transcribe:partial', onPartial);
      sock.on('transcribe:final', onFinal);
      sock.on('transcribe:error', onErrorEvt);
      sock.on('transcribe:ready', onReady);
      sock.on('transcribe:closed', onClosed);
      partialListenerRef.current = onPartial;
      finalListenerRef.current = onFinal;
      errorListenerRef.current = onErrorEvt;
      readyListenerRef.current = onReady;
      closedListenerRef.current = onClosed;

      sock.emit('transcribe:start', {
        accessToken: token,
        sessionId: options.sessionId,
        dialect: dialectRef.current,
      });

      const ok = await acquireMic();
      if (!ok) {
        sock.emit('transcribe:stop');
        return;
      }
      setIsRecording(true);
      setIsPaused(false);
    },
    [options, acquireMic]
  );

  const pauseRecording = useCallback(async () => {
    if (!isRecording || isPaused) return;
    const sock = getSocket();
    if (sock.connected) sock.emit('transcribe:pause');
    // Release the mic — privacy signal (mic LED turns off).
    releaseMic();
    currentInterimRef.current = '';
    setIsPaused(true);
  }, [isRecording, isPaused, releaseMic]);

  const resumeRecording = useCallback(async () => {
    if (!isRecording || !isPaused) return;
    const sock = getSocket();
    if (sock.connected) sock.emit('transcribe:resume');
    const ok = await acquireMic();
    if (!ok) {
      // Couldn't re-acquire (perm revoked, device gone). Treat as full stop.
      if (sock.connected) sock.emit('transcribe:stop');
      setIsRecording(false);
      setIsPaused(false);
      return;
    }
    setIsPaused(false);
  }, [isRecording, isPaused, acquireMic]);

  const stopRecording = useCallback(() => {
    const sock = getSocket();
    if (sock.connected) sock.emit('transcribe:stop');

    if (partialListenerRef.current) sock.off('transcribe:partial', partialListenerRef.current);
    if (finalListenerRef.current) sock.off('transcribe:final', finalListenerRef.current);
    if (errorListenerRef.current) sock.off('transcribe:error', errorListenerRef.current);
    if (readyListenerRef.current) sock.off('transcribe:ready', readyListenerRef.current);
    if (closedListenerRef.current) sock.off('transcribe:closed', closedListenerRef.current);
    partialListenerRef.current = null;
    finalListenerRef.current = null;
    errorListenerRef.current = null;
    readyListenerRef.current = null;
    closedListenerRef.current = null;

    releaseMic();
    currentInterimRef.current = '';
    setIsRecording(false);
    setIsPaused(false);
  }, [releaseMic]);

  return {
    isRecording,
    isPaused,
    audioLevel,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    error,
    isSupported,
  };
};
