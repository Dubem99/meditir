'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useAudioRecorder } from './useAudioRecorder';
import { useOfflineStore } from '@/store/offline.store';
import { useSessionStore } from '@/store/session.store';
import { connectSocket, getSocket, joinSession, leaveSession } from '@/lib/socket';
import { storeOfflineTranscription } from '@/lib/indexedDB';
import { api } from '@/lib/api';
import type { Dialect, Transcription } from '@/types/entities.types';

export const useTranscription = (
  sessionId: string,
  roomToken: string,
  dialect: Dialect
) => {
  const isOnline = useOfflineStore((s) => s.isOnline);
  const incrementPending = useOfflineStore((s) => s.incrementPending);
  const addTranscription = useSessionStore((s) => s.addTranscription);
  const setRecording = useSessionStore((s) => s.setRecording);
  const recorder = useAudioRecorder(dialect);
  const startMsRef = useRef(Date.now());
  const [interimText, setInterimText] = useState<string>('');

  // Connect socket and join room on mount
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

  // Stable ref to the latest segment handler so the recorder always calls
  // fresh state (isOnline, dialect, etc) without needing to restart.
  const handleSegmentRef = useRef<(s: { text: string; isFinal: boolean }) => void>(() => {});
  handleSegmentRef.current = ({ text, isFinal }) => {
    if (!text) return;

    if (!isFinal) {
      setInterimText(text);
      return;
    }

    // Final segment — clear interim display and persist
    setInterimText('');
    const startMs = Date.now() - startMsRef.current;

    if (isOnline) {
      api
        .post('/transcriptions/segment', { sessionId, text, speakerTag: 'DOCTOR', startMs, dialect })
        .then((res) => addTranscription(res.data.data))
        .catch(() => {
          // Socket fallback — still shows the final locally so the doctor sees it
          addTranscription({
            id: `local-${Date.now()}`,
            sessionId,
            text,
            speakerTag: 'DOCTOR',
            startMs,
            dialect,
            createdAt: new Date().toISOString(),
          });
          try {
            getSocket().emit('transcription:text_segment', { sessionId, text, speakerTag: 'DOCTOR', startMs, dialect });
          } catch {}
        });
    } else {
      // Offline — show locally and queue for sync
      addTranscription({
        id: `offline-${Date.now()}`,
        sessionId,
        text,
        speakerTag: 'DOCTOR',
        startMs,
        dialect,
        createdAt: new Date().toISOString(),
      });
      storeOfflineTranscription({
        sessionId,
        text,
        dialect,
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

  return {
    isRecording: recorder.isRecording,
    startTranscription,
    stopTranscription,
    error: recorder.error,
    isSupported: recorder.isSupported,
    isOnline,
    interimText,
  };
};
