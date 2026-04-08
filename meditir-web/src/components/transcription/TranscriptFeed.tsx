'use client';

import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import type { Transcription } from '@/types/entities.types';

interface Props {
  transcriptions: Transcription[];
  isLive?: boolean;
}

export const TranscriptFeed = ({ transcriptions, isLive }: Props) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptions]);

  if (transcriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400">
        <svg className="h-8 w-8 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <p className="text-sm">
          {isLive ? 'Waiting for speech...' : 'No transcriptions yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-96 pr-1">
      {transcriptions.map((t) => (
        <div
          key={t.id}
          className={clsx(
            'flex gap-3 rounded-lg p-3',
            t.speakerTag === 'DOCTOR' ? 'bg-primary-50 border border-primary-100' : 'bg-gray-50 border border-gray-100'
          )}
        >
          <span
            className={clsx(
              'text-xs font-semibold uppercase tracking-wide mt-0.5 min-w-[60px]',
              t.speakerTag === 'DOCTOR' ? 'text-primary-700' : 'text-gray-500'
            )}
          >
            {t.speakerTag || 'UNKNOWN'}
          </span>
          <p className="text-sm text-gray-800 leading-relaxed">{t.text}</p>
        </div>
      ))}
      {isLive && (
        <div className="flex items-center gap-2 text-xs text-gray-400 ml-2">
          <span className="flex gap-0.5">
            <span className="animate-bounce delay-0 w-1 h-1 bg-gray-400 rounded-full" />
            <span className="animate-bounce delay-100 w-1 h-1 bg-gray-400 rounded-full" />
            <span className="animate-bounce delay-200 w-1 h-1 bg-gray-400 rounded-full" />
          </span>
          Transcribing...
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};
