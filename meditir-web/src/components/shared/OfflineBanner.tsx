'use client';

import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useOfflineStore } from '@/store/offline.store';

export const OfflineBanner = () => {
  const { isOnline } = useOfflineSync();
  const pendingCount = useOfflineStore((s) => s.pendingCount);

  if (isOnline && pendingCount === 0) return null;

  if (isOnline && pendingCount > 0) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-primary-600 text-white text-center py-2 text-sm font-medium shadow-md flex items-center justify-center gap-2">
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Syncing {pendingCount} offline transcription{pendingCount !== 1 ? 's' : ''}…
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-2 text-sm font-medium shadow-md">
      You are offline.{pendingCount > 0 ? ` ${pendingCount} transcription${pendingCount !== 1 ? 's' : ''} will sync when reconnected.` : ' Transcriptions will be saved locally and synced when reconnected.'}
    </div>
  );
};
