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
// Browser audio chain:
//   getUserMedia → MediaStreamSource → AudioWorkletNode(pcm-worklet)
//                                          ↓ posts Int16 ArrayBuffer
//                                   socket.emit('transcribe:audio', buf)

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
}

const TARGET_SAMPLE_RATE = 24_000; // OpenAI Realtime Transcription expects pcm16 24kHz mono

export const useAudioRecorder = (
  dialect: Dialect = 'NIGERIAN_ENGLISH',
  options?: AudioRecorderOptions
): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onSegmentRef = useRef<(segment: TranscriptSegment) => void>(() => {});
  const dialectRef = useRef<Dialect>(dialect);
  dialectRef.current = dialect;

  // Listeners attached during start, removed on stop. Holding refs lets us
  // remove the exact same function references later.
  const partialListenerRef = useRef<((p: { text: string }) => void) | null>(null);
  const finalListenerRef = useRef<((p: { transcription: Transcription }) => void) | null>(null);
  const errorListenerRef = useRef<((p: { message: string }) => void) | null>(null);
  const closedListenerRef = useRef<(() => void) | null>(null);

  // Accumulates delta text across one utterance. Reset on final.
  const currentInterimRef = useRef<string>('');

  const isSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'mediaDevices' in navigator &&
    'getUserMedia' in navigator.mediaDevices &&
    typeof (window as typeof window & { AudioContext?: typeof AudioContext }).AudioContext !== 'undefined';

  const cleanup = useCallback(() => {
    const sock = getSocket();

    // Detach socket listeners
    if (partialListenerRef.current) sock.off('transcribe:partial', partialListenerRef.current);
    if (finalListenerRef.current) sock.off('transcribe:final', finalListenerRef.current);
    if (errorListenerRef.current) sock.off('transcribe:error', errorListenerRef.current);
    if (closedListenerRef.current) sock.off('transcribe:closed', closedListenerRef.current);
    partialListenerRef.current = null;
    finalListenerRef.current = null;
    errorListenerRef.current = null;
    closedListenerRef.current = null;

    if (workletRef.current) {
      try { workletRef.current.disconnect(); } catch { /* ignore */ }
      workletRef.current.port.onmessage = null;
      workletRef.current = null;
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
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    currentInterimRef.current = '';
  }, []);

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
      const token = getAccessToken();
      if (!token) {
        setError('Not authenticated.');
        return;
      }

      onSegmentRef.current = onSegment;
      setError(null);

      // Ensure socket is connected
      const sock = connectSocket();

      // Set up listeners BEFORE emitting start so we don't miss early events.
      const onPartial = ({ text: delta }: { text: string }) => {
        if (!delta) return;
        currentInterimRef.current += delta;
        onSegmentRef.current({ text: currentInterimRef.current, isFinal: false });
      };
      const onFinal = ({ transcription }: { transcription: Transcription }) => {
        currentInterimRef.current = '';
        if (transcription && transcription.text) {
          onSegmentRef.current({
            text: transcription.text,
            isFinal: true,
            transcription,
          });
        }
      };
      const onErrorEvt = ({ message }: { message: string }) => {
        setError(`STT error: ${message}`);
      };
      const onClosed = () => {
        // Server-initiated close. Keep the audio chain alive in case the user
        // is still trying to record — but surface the state.
      };

      sock.on('transcribe:partial', onPartial);
      sock.on('transcribe:final', onFinal);
      sock.on('transcribe:error', onErrorEvt);
      sock.on('transcribe:closed', onClosed);
      partialListenerRef.current = onPartial;
      finalListenerRef.current = onFinal;
      errorListenerRef.current = onErrorEvt;
      closedListenerRef.current = onClosed;

      sock.emit('transcribe:start', {
        accessToken: token,
        sessionId: options.sessionId,
        dialect: dialectRef.current,
      });

      // Mic capture
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
        cleanup();
        sock.emit('transcribe:stop');
        return;
      }
      streamRef.current = stream;

      // AudioContext at 24 kHz so the browser does the resampling for us.
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
        cleanup();
        sock.emit('transcribe:stop');
        return;
      }

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const worklet = new AudioWorkletNode(ctx, 'pcm-worklet');
      workletRef.current = worklet;

      worklet.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
        // Forward raw PCM16 little-endian bytes. socket.io will frame this as
        // a binary attachment — Node side receives a Buffer.
        if (sock.connected) {
          sock.emit('transcribe:audio', event.data);
        }
      };

      source.connect(worklet);
      // Don't connect to ctx.destination — we don't want to play the mic back
      // through the speakers. The worklet still pulls input as long as the
      // source is connected to it.

      setIsRecording(true);
    },
    [isSupported, options, cleanup]
  );

  const stopRecording = useCallback(() => {
    const sock = getSocket();
    if (sock.connected) sock.emit('transcribe:stop');
    cleanup();
    setIsRecording(false);
  }, [cleanup]);

  return { isRecording, startRecording, stopRecording, error, isSupported };
};
