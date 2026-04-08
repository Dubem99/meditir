'use client';

import { useEffect, useCallback } from 'react';
import { useAudioRecorder } from './useAudioRecorder';
import { useOfflineStore } from '@/store/offline.store';
import { useSessionStore } from '@/store/session.store';
import { connectSocket, getSocket, sendAudioChunk, joinSession, leaveSession } from '@/lib/socket';
import { storeOfflineChunk } from '@/lib/indexedDB';
import type { Dialect, Transcription } from '@/types/entities.types';

export const useTranscription = (
  sessionId: string,
  roomToken: string,
  dialect: Dialect,
  sessionStartMs: number = 0
) => {
  const { isOnline } = useOfflineStore();
  const { addTranscription, setRecording } = useSessionStore();
  const recorder = useAudioRecorder();
  let chunkIndex = 0;

  // Connect socket and join room on mount
  useEffect(() => {
    const socket = connectSocket();
    joinSession(roomToken);

    socket.on('joined:session', () => {
      console.log('Joined session room', roomToken);
    });

    socket.on('transcription:new_segment', (segment: Transcription) => {
      addTranscription(segment);
    });

    socket.on('transcription:error', (err: { message: string }) => {
      console.error('Transcription error:', err.message);
    });

    return () => {
      leaveSession(roomToken);
      socket.off('transcription:new_segment');
      socket.off('transcription:error');
      socket.off('joined:session');
    };
  }, [roomToken]);

  const handleChunk = useCallback(
    async (chunk: ArrayBuffer) => {
      const startMs = sessionStartMs + chunkIndex * 3000;
      chunkIndex++;

      if (isOnline) {
        sendAudioChunk({ sessionId, chunk, dialect, speakerTag: 'DOCTOR', startMs });
      } else {
        // Store offline for later sync
        await storeOfflineChunk({
          sessionId,
          blob: new Blob([chunk], { type: 'audio/webm' }),
          dialect,
          speakerTag: 'DOCTOR',
          startMs,
          createdAt: Date.now(),
        });
      }
    },
    [sessionId, dialect, isOnline, sessionStartMs]
  );

  const startTranscription = useCallback(async () => {
    await recorder.startRecording(handleChunk);
    setRecording(true);
  }, [recorder, handleChunk, setRecording]);

  const stopTranscription = useCallback(() => {
    recorder.stopRecording();
    setRecording(false);
  }, [recorder, setRecording]);

  return {
    isRecording: recorder.isRecording,
    startTranscription,
    stopTranscription,
    error: recorder.error,
    isOnline,
  };
};
