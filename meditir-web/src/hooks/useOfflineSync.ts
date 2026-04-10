'use client';

import { useEffect } from 'react';
import { useOfflineStore } from '@/store/offline.store';
import { api } from '@/lib/api';
import { getPendingTranscriptions, markTranscriptionsSynced } from '@/lib/indexedDB';

export const useOfflineSync = (sessionId?: string) => {
  const { isOnline, setOnline, resetPending } = useOfflineStore();

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  // When we come back online, flush pending transcriptions
  useEffect(() => {
    if (!isOnline || !sessionId) return;

    const sync = async () => {
      const pending = await getPendingTranscriptions(sessionId);
      if (pending.length === 0) return;

      try {
        await api.post('/transcriptions/offline-sync', {
          chunks: pending.map((p) => ({
            sessionId: p.sessionId,
            text: p.text || '[offline audio — transcription pending]',
            dialect: p.dialect,
            speakerTag: p.speakerTag,
            startMs: p.startMs,
            endMs: p.endMs,
            createdAt: new Date(p.createdAt).toISOString(),
          })),
        });

        const ids = pending.map((p) => p.id!);
        await markTranscriptionsSynced(ids);
        resetPending();
      } catch (err) {
        console.error('Offline sync failed', err);
      }
    };

    sync();
  }, [isOnline, sessionId]);

  return { isOnline };
};
