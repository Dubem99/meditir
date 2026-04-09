'use client';

import { useState } from 'react';
import { useTTS } from '@/hooks/useTTS';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface Props {
  noteId: string;
  cachedAudioUrl?: string;
}

export const TTSPlayer = ({ noteId, cachedAudioUrl }: Props) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(cachedAudioUrl || null);
  const [isFetching, setIsFetching] = useState(false);
  const { play, pause, stop, isPlaying, isLoading } = useTTS();

  const fetchAndPlay = async () => {
    let url = audioUrl;
    if (!url) {
      setIsFetching(true);
      try {
        const res = await api.get(`/soap-notes/${noteId}/tts`);
        url = res.data.data.audioUrl;
        setAudioUrl(url);
      } catch {
        alert('Failed to generate audio. Please try again.');
        return;
      } finally {
        setIsFetching(false);
      }
    }
    if (url) await play(url);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <svg className="h-5 w-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a7.975 7.975 0 015.657 2.343m0 0A7.975 7.975 0 0120 12m-2.343 5.657A7.975 7.975 0 0112 20m0 0a7.975 7.975 0 01-5.657-2.343m0 0A7.975 7.975 0 014 12m2.343-5.657A7.975 7.975 0 0112 4" />
      </svg>
      <span className="text-sm text-blue-800 font-medium flex-1">Listen to this note</span>
      <div className="flex items-center gap-2">
        {(isFetching || isLoading) && <Spinner size="sm" />}
        {!isPlaying ? (
          <Button size="sm" variant="secondary" onClick={fetchAndPlay} loading={isFetching || isLoading}>
            Play
          </Button>
        ) : (
          <>
            <Button size="sm" variant="ghost" onClick={pause}>Pause</Button>
            <Button size="sm" variant="ghost" onClick={stop}>Stop</Button>
          </>
        )}
      </div>
    </div>
  );
};
