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

const calculateAge = (dob?: string | null): number | null => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

export const TranscriptionRoom = ({ session, onSessionEnd }: Props) => {
  const [dialect, setDialect] = useState<Dialect>(session.dialect);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showDialect, setShowDialect] = useState(false);
  const [showPatientContext, setShowPatientContext] = useState(true);
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

  // Auto-scroll transcript on new final segments and interim updates
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptions, interimText]);

  // Spacebar toggles recording (ignore if focused in an input)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      e.preventDefault();
      if (!isSupported) return;
      if (isRecording) stopTranscription();
      else startTranscription();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isRecording, isSupported, startTranscription, stopTranscription]);

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

  const patient = session.patient;
  const age = calculateAge(patient.dateOfBirth);
  const allergies = patient.allergies ?? [];
  const chronicConditions = patient.chronicConditions ?? [];
  const hasContext =
    age !== null ||
    patient.gender ||
    patient.bloodGroup ||
    patient.genotype ||
    allergies.length > 0 ||
    chronicConditions.length > 0;

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-8rem)]">
      {/* Top bar */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-900 truncate">
              {patient.firstName} {patient.lastName}
            </h2>
            {patient.medicalRecordNo && (
              <span className="text-xs font-mono text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                {patient.medicalRecordNo}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {age !== null && <span className="text-sm text-gray-500">{age} yrs</span>}
            {patient.gender && (
              <span className="text-sm text-gray-500">· {patient.gender.toLowerCase()}</span>
            )}
            {patient.bloodGroup && (
              <span className="text-xs font-mono text-gray-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                {patient.bloodGroup}
              </span>
            )}
            {patient.genotype && (
              <span className="text-xs font-mono text-gray-600 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded">
                {patient.genotype}
              </span>
            )}
            {!isOnline && (
              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                Offline
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowDialect(!showDialect)}
            className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-lg transition-colors"
          >
            Dialect
          </button>
          <button
            onClick={handleEnd}
            disabled={isEndingSession}
            className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            {isEndingSession ? 'Ending…' : 'End & Generate Note'}
          </button>
        </div>
      </div>

      {showDialect && (
        <div className="mb-4">
          <DialectSelector
            value={dialect}
            onChange={(d) => {
              setDialect(d);
              setShowDialect(false);
            }}
            disabled={isRecording}
          />
        </div>
      )}

      {/* Patient context card */}
      {hasContext && (
        <div className="mb-5 bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowPatientContext(!showPatientContext)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Patient context
            </span>
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform ${showPatientContext ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showPatientContext && (
            <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                  Allergies
                </p>
                {allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {allergies.map((a) => (
                      <span
                        key={a}
                        className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5 font-medium"
                      >
                        ⚠ {a}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">None documented</p>
                )}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                  Chronic conditions
                </p>
                {chronicConditions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {chronicConditions.map((c) => (
                      <span
                        key={c}
                        className="text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2 py-0.5 font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">None documented</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-5">
        {/* Recording column */}
        <div className="lg:w-80 shrink-0">
          <div
            className={`bg-white rounded-2xl border p-6 flex flex-col items-center justify-center gap-4 transition-all ${
              isRecording
                ? 'border-red-200 bg-gradient-to-b from-red-50/30 to-white'
                : 'border-gray-200'
            }`}
          >
            {/* Duration */}
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                {isRecording ? 'Recording' : 'Ready'}
              </p>
              <p
                className={`text-4xl font-bold tabular-nums ${
                  isRecording ? 'text-red-500' : 'text-gray-300'
                }`}
              >
                {formatTime(elapsed)}
              </p>
            </div>

            {/* Record button */}
            {!isRecording ? (
              <button
                onClick={startTranscription}
                disabled={!isSupported}
                className="relative w-24 h-24 rounded-full bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all active:scale-95"
              >
                <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </button>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
                <div className="absolute -inset-2 rounded-full border-2 border-red-300 animate-pulse" />
                <button
                  onClick={stopTranscription}
                  className="relative w-24 h-24 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xl transition-all active:scale-95"
                >
                  <span className="w-7 h-7 bg-white rounded-md" />
                </button>
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-500">
                {!isSupported
                  ? 'Use Chrome or Edge to record'
                  : isRecording
                  ? 'Tap to stop'
                  : 'Tap to start recording'}
              </p>
              {isSupported && (
                <p className="text-[10px] text-gray-400 mt-1">
                  or press{' '}
                  <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">
                    Space
                  </kbd>
                </p>
              )}
            </div>

            {error && (
              <div className="w-full bg-red-50 border border-red-200 rounded-lg p-2 text-center">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Live transcript */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Live Transcript</span>
              {isRecording && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
            </div>
            <span className="text-xs text-gray-400">
              {transcriptions.length} segment{transcriptions.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex-1 p-5 overflow-y-auto space-y-3 min-h-[300px] max-h-[500px]">
            {transcriptions.length === 0 && !interimText ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <svg
                  className="h-12 w-12 text-gray-200 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-7a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                <p className="text-sm text-gray-400">
                  {isRecording ? 'Listening… speak now' : 'Start recording to see live transcript'}
                </p>
              </div>
            ) : (
              <>
                {transcriptions.map((t, i) => (
                  <div key={t.id} className="flex gap-3 group">
                    <span className="shrink-0 text-[10px] font-mono text-gray-300 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5 min-w-[36px] text-center tabular-nums self-start mt-0.5">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="text-sm text-gray-800 leading-relaxed flex-1">{t.text}</p>
                  </div>
                ))}
                {interimText && (
                  <div className="flex gap-3">
                    <span className="shrink-0 w-[36px] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                    </span>
                    <p className="text-sm text-gray-500 leading-relaxed italic flex-1">
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
