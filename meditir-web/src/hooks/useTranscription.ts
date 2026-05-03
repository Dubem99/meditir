'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useAudioRecorder } from './useAudioRecorder';
import type { TranscriptSegment } from './useAudioRecorder';
import { useOfflineStore } from '@/store/offline.store';
import { useSessionStore } from '@/store/session.store';
import { connectSocket, joinSession, leaveSession } from '@/lib/socket';
import { storeOfflineTranscription } from '@/lib/indexedDB';
import type { Dialect, Transcription } from '@/types/entities.types';
import type { DialectChoice } from '@/components/transcription/DialectSelector';

export const useTranscription = (
  sessionId: string,
  roomToken: string,
  dialect: DialectChoice
) => {
  const isOnline = useOfflineStore((s) => s.isOnline);
  const incrementPending = useOfflineStore((s) => s.incrementPending);
  const addTranscription = useSessionStore((s) => s.addTranscription);
  const setRecording = useSessionStore((s) => s.setRecording);
  const recorder = useAudioRecorder(dialect, { sessionId });
  const startMsRef = useRef(Date.now());
  const [interimText, setInterimText] = useState<string>('');

  // Connect socket and join room on mount — the socket layer is still used
  // for cross-device fan-out (e.g., admin viewing the live transcript).
  useEffect(() => {
    const socket = connectSocket();
    joinSession(roomToken);

    const handler = (segment: Transcription) => addTranscription(segment);
    socket.on('transcription:new_segment', handler);

    return () => {
      leaveSession(roomToken);
      socket.off('transcription:new_segment', handler);
    };
  }, [roomToken, addTranscription]);

  // Stable ref so the recorder always calls fresh state without needing to
  // restart when isOnline / dialect change.
  const handleSegmentRef = useRef<(s: TranscriptSegment) => void>(() => {});
  handleSegmentRef.current = ({ text, isFinal, transcription }) => {
    if (!text) return;

    if (!isFinal) {
      setInterimText(text);
      return;
    }

    // Final segment — clear interim display.
    setInterimText('');

    // Online path: the /transcriptions/stream endpoint already saved the
    // transcription server-side and returned the full record. Just put it in
    // the local store; no second POST needed.
    if (transcription) {
      addTranscription(transcription);
      return;
    }

    // Offline / fallback path: no server round-trip happened (or it failed).
    // Show the text locally and queue for sync once we're back online.
    // Auto-detect doesn't have a Prisma Dialect value — fall back to the
    // patient's most likely tongue (Nigerian English) for persistence.
    const persistedDialect: Dialect =
      dialect === 'AUTO_DETECT' ? 'NIGERIAN_ENGLISH' : (dialect as Dialect);
    const startMs = Date.now() - startMsRef.current;
    addTranscription({
      id: `offline-${Date.now()}`,
      sessionId,
      text,
      speakerTag: 'DOCTOR',
      startMs,
      dialect: persistedDialect,
      createdAt: new Date().toISOString(),
    });
    if (!isOnline) {
      storeOfflineTranscription({
        sessionId,
        text,
        dialect: persistedDialect,
        speakerTag: 'DOCTOR',
        startMs,
        createdAt: Date.now(),
        synced: false,
      });
      incrementPending();
    }
  };

  const startTranscription = useCallback(() => {
    startMsRef.current = Date.now();
    setInterimText('');
    recorder.startRecording((seg) => handleSegmentRef.current(seg));
    setRecording(true);
  }, [recorder, setRecording]);

  const stopTranscription = useCallback(() => {
    recorder.stopRecording();
    setInterimText('');
    setRecording(false);
  }, [recorder, setRecording]);

  const pauseTranscription = useCallback(() => {
    void recorder.pauseRecording();
    setRecording(false);
  }, [recorder, setRecording]);

  const resumeTranscription = useCallback(() => {
    void recorder.resumeRecording();
    setRecording(true);
  }, [recorder, setRecording]);

  return {
    isRecording: recorder.isRecording,
    isPaused: recorder.isPaused,
    audioLevel: recorder.audioLevel,
    startTranscription,
    pauseTranscription,
    resumeTranscription,
    stopTranscription,
    error: recorder.error,
    isSupported: recorder.isSupported,
    isOnline,
    interimText,
  };
};
