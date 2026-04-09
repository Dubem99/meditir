'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAudioRecorder } from './useAudioRecorder';
import { useOfflineStore } from '@/store/offline.store';
import { useSessionStore } from '@/store/session.store';
import { connectSocket, getSocket, joinSession, leaveSession } from '@/lib/socket';
import { storeOfflineTranscription } from '@/lib/indexedDB';
import type { Dialect, Transcription } from '@/types/entities.types';

export const useTranscription = (
  sessionId: string,
  roomToken: string,
  dialect: Dialect
) => {
  const { isOnline } = useOfflineStore();
  const { addTranscription, setRecording } = useSessionStore();
  const recorder = useAudioRecorder(dialect);
  const startMsRef = useRef(Date.now());
  const interimRef = useRef<string>('');

  // Connect socket and join room on mount
  useEffect(() => {
    const socket = connectSocket();
    joinSession(roomToken);

    socket.on('transcription:new_segment', (segment: Transcription) => {
      addTranscription(segment);
    });

    return () => {
      leaveSession(roomToken);
      socket.off('transcription:new_segment');
    };
  }, [roomToken, addTranscription]);

  const handleSegment = useCallback(
    ({ text, isFinal }: { text: string; isFinal: boolean }) => {
      if (!isFinal) {
        interimRef.current = text;
        return;
      }

      // Only send final segments
      interimRef.current = '';
      const startMs = Date.now() - startMsRef.current;

      if (isOnline) {
        // Send text (not audio) to server via socket
        getSocket().emit('transcription:text_segment', {
          sessionId,
          text,
          speakerTag: 'DOCTOR',
          startMs,
          dialect,
        });
      } else {
        storeOfflineTranscription({
          sessionId,
          text,
          dialect,
          speakerTag: 'DOCTOR',
          startMs,
          createdAt: Date.now(),
          synced: false,
        });
      }
    },
    [sessionId, dialect, isOnline]
  );

  const startTranscription = useCallback(() => {
    startMsRef.current = Date.now();
    recorder.startRecording(handleSegment);
    setRecording(true);
  }, [recorder, handleSegment, setRecording]);

  const stopTranscription = useCallback(() => {
    recorder.stopRecording();
    setRecording(false);
  }, [recorder, setRecording]);

  return {
    isRecording: recorder.isRecording,
    startTranscription,
    stopTranscription,
    error: recorder.error,
    isSupported: recorder.isSupported,
    isOnline,
  };
};
