'use client';

import { useOfflineSync } from '@/hooks/useOfflineSync';

export const OfflineBanner = () => {
  const { isOnline } = useOfflineSync();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-2 text-sm font-medium shadow-md">
      You are offline. Transcriptions will be saved locally and synced when reconnected.
    </div>
  );
};
