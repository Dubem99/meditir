'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranscription } from '@/hooks/useTranscription';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useSessionStore } from '@/store/session.store';
import { DialectSelector } from './DialectSelector';
import type { ConsultationSession, Dialect } from '@/types/entities.types';
import { api } from '@/lib/api';

interface Props {
  session: ConsultationSession;
  onSessionEnd: (sessionId: string) => void;
}

export const TranscriptionRoom = ({ session, onSessionEnd }: Props) => {
  const [dialect, setDialect] = useState<Dialect>(session.dialect);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showDialect, setShowDialect] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const transcriptions = useSessionStore((s) => s.transcriptions);
  const { isOnline } = useOfflineSync(session.id);
  const { isRecording, startTranscription, stopTranscription, error, isSupported, interimText } = useTranscription(
    session.id,
    session.roomToken!,
    dialect
  );

  // Timer
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  // Auto-scroll transcript on new final segments and on interim updates
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptions, interimText]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleEnd = async () => {
    setIsEndingSession(true);
    if (isRecording) stopTranscription();
    try {
      await api.post(`/sessions/${session.id}/end`);
      onSessionEnd(session.id);
    } catch {
      setIsEndingSession(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-8rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {session.patient.firstName} {session.patient.lastName}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            {isRecording && (
              <span className="flex items-center gap-1.5 text-sm text-red-500 font-medium">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {formatTime(elapsed)}
              </span>
            )}
            {!isOnline && (
              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                Offline
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowDialect(!showDialect)}
            className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Dialect
          </button>
          <button
            onClick={handleEnd}
            disabled={isEndingSession}
            className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
          >
            {isEndingSession ? 'Ending...' : 'End & Generate Note'}
          </button>
        </div>
      </div>

      {showDialect && (
        <div className="mb-4">
          <DialectSelector value={dialect} onChange={(d) => { setDialect(d); setShowDialect(false); }} disabled={isRecording} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Record button area */}
        <div className="flex flex-col items-center justify-center py-8">
          {!isRecording ? (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={startTranscription}
                disabled={!isSupported}
                className="w-20 h-20 rounded-full bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </button>
              <p className="text-sm text-gray-500">
                {!isSupported ? 'Use Chrome or Edge for transcription' : 'Tap to start recording'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
                <button
                  onClick={stopTranscription}
                  className="relative w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all active:scale-95"
                >
                  <span className="w-6 h-6 bg-white rounded-sm" />
                </button>
              </div>
              <p className="text-sm text-red-500 font-medium">Recording · {formatTime(elapsed)}</p>
            </div>
          )}
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        {/* Live transcript */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Live Transcript</span>
            <span className="text-xs text-gray-400">{transcriptions.length} segments</span>
          </div>
          <div className="p-5 overflow-y-auto max-h-96 space-y-3">
            {transcriptions.length === 0 && !interimText ? (
              <p className="text-gray-400 text-sm text-center py-8">
                {isRecording ? 'Listening... speak now' : 'Start recording to see live transcript'}
              </p>
            ) : (
              <>
                {transcriptions.map((t) => (
                  <div key={t.id} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 shrink-0" />
                    <p className="text-sm text-gray-800 leading-relaxed">{t.text}</p>
                  </div>
                ))}
                {interimText && (
                  <div className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-300 mt-2 shrink-0 animate-pulse" />
                    <p className="text-sm text-gray-500 leading-relaxed italic">
                      {interimText}
                      <span className="inline-block w-0.5 h-3 bg-primary-400 ml-0.5 animate-pulse align-middle" />
                    </p>
                  </div>
                )}
              </>
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
