'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranscription } from '@/hooks/useTranscription';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useSessionStore } from '@/store/session.store';
import { DialectSelector } from './DialectSelector';
import { TemplateSelector } from './TemplateSelector';
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
  const [templateId, setTemplateId] = useState<string>(session.templateId ?? 'general-practice');
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeSheet, setActiveSheet] = useState<'dialect' | 'template' | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const transcriptions = useSessionStore((s) => s.transcriptions);
  const { isOnline } = useOfflineSync(session.id);
  const {
    isRecording,
    isPaused,
    audioLevel,
    startTranscription,
    pauseTranscription,
    resumeTranscription,
    stopTranscription,
    error,
    isSupported,
    interimText,
  } = useTranscription(session.id, session.roomToken!, dialect);

  useEffect(() => {
    if (!isRecording || isPaused) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptions, interimText]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      e.preventDefault();
      if (!isSupported) return;
      if (!isRecording) {
        startTranscription();
      } else if (isPaused) {
        resumeTranscription();
      } else {
        pauseTranscription();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isRecording, isPaused, isSupported, startTranscription, pauseTranscription, resumeTranscription]);

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
  const hasClinicalFlags = allergies.length > 0 || chronicConditions.length > 0;

  const stateLabel = !isRecording ? 'Ready' : isPaused ? 'Paused' : 'Recording';
  const stateColor = !isRecording
    ? 'text-gray-400'
    : isPaused
    ? 'text-amber-600'
    : 'text-red-600';

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-8rem)]">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/doctor/patients/${patient.id}`}
            className="text-2xl font-semibold text-gray-900 hover:text-primary-600 transition-colors"
            title="View full patient history"
          >
            {patient.firstName} {patient.lastName}
          </Link>
          <div className="flex items-center gap-x-3 gap-y-1 mt-1 flex-wrap text-sm text-gray-500">
            {age !== null && <span>{age} yrs</span>}
            {patient.gender && <span>· {patient.gender.toLowerCase()}</span>}
            {patient.medicalRecordNo && (
              <span className="font-mono text-xs text-gray-400">· {patient.medicalRecordNo}</span>
            )}
            {patient.bloodGroup && (
              <span className="font-mono text-xs text-gray-600">· {patient.bloodGroup}</span>
            )}
            {patient.genotype && (
              <span className="font-mono text-xs text-gray-600">· {patient.genotype}</span>
            )}
            {!isOnline && (
              <span className="text-xs text-amber-600 font-medium">· Offline</span>
            )}
          </div>
        </div>
        <button
          onClick={handleEnd}
          disabled={isEndingSession}
          className="bg-gray-900 hover:bg-black disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm shrink-0"
        >
          {isEndingSession ? 'Ending…' : 'Finish & generate note'}
        </button>
      </div>

      {/* Allergy / chronic flags — only when present */}
      {hasClinicalFlags && (
        <div className="flex items-center gap-2 flex-wrap mb-6 text-xs">
          {allergies.length > 0 && (
            <>
              <span className="text-gray-400 uppercase tracking-wider font-semibold">Allergies</span>
              {allergies.map((a) => (
                <span key={a} className="text-red-700 bg-red-50 border border-red-100 rounded-md px-2 py-0.5">
                  {a}
                </span>
              ))}
            </>
          )}
          {chronicConditions.length > 0 && (
            <>
              <span className="text-gray-400 uppercase tracking-wider font-semibold ml-2">Chronic</span>
              {chronicConditions.map((c) => (
                <span key={c} className="text-purple-700 bg-purple-50 border border-purple-100 rounded-md px-2 py-0.5">
                  {c}
                </span>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── Main recording stage ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center py-12">
        {/* Timer */}
        <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] mb-3 ${stateColor}`}>
          {stateLabel}
        </p>
        <p
          className={`text-7xl font-light tabular-nums mb-12 ${
            isRecording && !isPaused
              ? 'text-gray-900'
              : isPaused
              ? 'text-amber-700'
              : 'text-gray-300'
          }`}
        >
          {formatTime(elapsed)}
        </p>

        {/* Big record / pause / resume button */}
        <div className="relative">
          {!isRecording ? (
            <button
              onClick={startTranscription}
              disabled={!isSupported}
              aria-label="Start recording"
              className="relative w-28 h-28 rounded-full bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <svg className="h-11 w-11" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>
          ) : isPaused ? (
            <>
              <div className="absolute -inset-3 rounded-full bg-amber-200/50 blur-md" />
              <button
                onClick={resumeTranscription}
                aria-label="Resume recording"
                className="relative w-28 h-28 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-lg transition-all active:scale-95"
              >
                <svg className="h-11 w-11 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <div
                className="absolute inset-0 rounded-full bg-red-400 transition-transform duration-75"
                style={{
                  transform: `scale(${1 + audioLevel * 0.4})`,
                  opacity: 0.18 + audioLevel * 0.4,
                }}
              />
              <div className="absolute -inset-3 rounded-full border border-red-200 animate-pulse" />
              <button
                onClick={pauseTranscription}
                aria-label="Pause recording"
                className="relative w-28 h-28 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all active:scale-95"
              >
                <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Audio level bar */}
        {isRecording && !isPaused && (
          <div className="w-48 h-[3px] bg-gray-100 rounded-full overflow-hidden mt-8">
            <div
              className="h-full bg-red-500 transition-all duration-75"
              style={{ width: `${Math.round(audioLevel * 100)}%` }}
            />
          </div>
        )}

        {/* Hint */}
        <p className="text-sm text-gray-500 mt-6">
          {!isSupported
            ? 'Use Chrome, Edge, Safari, or Firefox to record'
            : !isRecording
            ? 'Tap to start recording'
            : isPaused
            ? 'Tap to resume'
            : 'Tap to pause'}
        </p>
        {isSupported && (
          <p className="text-[11px] text-gray-400 mt-1.5">
            or press{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">
              Space
            </kbd>
          </p>
        )}

        {error && (
          <div className="mt-6 max-w-md bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* ── Bottom toolbar ─────────────────────────────────────────── */}
      <div className="border-t border-gray-100 pt-4 mt-2">
        {/* Sheet — Dialect */}
        {activeSheet === 'dialect' && (
          <div className="mb-4">
            <DialectSelector
              value={dialect}
              onChange={(d) => {
                setDialect(d);
                setActiveSheet(null);
              }}
              disabled={isRecording}
            />
          </div>
        )}

        {/* Sheet — Template */}
        {activeSheet === 'template' && (
          <div className="mb-4">
            <TemplateSelector
              sessionId={session.id}
              value={templateId}
              onChange={(id) => {
                setTemplateId(id);
                setActiveSheet(null);
              }}
            />
          </div>
        )}

        {/* Transcript drawer */}
        {showTranscript && (
          <div className="mb-4 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">Live transcript</span>
                {isRecording && !isPaused && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <span className="text-xs text-gray-400">
                {transcriptions.length} segment{transcriptions.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="p-4 overflow-y-auto space-y-2 max-h-[280px]">
              {transcriptions.length === 0 && !interimText ? (
                <p className="text-xs text-gray-400 text-center py-6">
                  {isRecording ? 'Listening…' : 'Nothing recorded yet.'}
                </p>
              ) : (
                <>
                  {transcriptions.map((t) => (
                    <p key={t.id} className="text-sm text-gray-800 leading-relaxed">
                      {t.text}
                    </p>
                  ))}
                  {interimText && (
                    <p className="text-sm text-gray-400 leading-relaxed italic">
                      {interimText}
                      <span className="inline-block w-0.5 h-3 bg-primary-400 ml-0.5 animate-pulse align-middle" />
                    </p>
                  )}
                </>
              )}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        )}

        {/* Toolbar buttons */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <ToolbarButton
              label="Template"
              active={activeSheet === 'template'}
              onClick={() =>
                setActiveSheet(activeSheet === 'template' ? null : 'template')
              }
            />
            <ToolbarButton
              label="Dialect"
              active={activeSheet === 'dialect'}
              onClick={() =>
                setActiveSheet(activeSheet === 'dialect' ? null : 'dialect')
              }
            />
            <ToolbarButton
              label={showTranscript ? 'Hide transcript' : 'Show transcript'}
              active={showTranscript}
              onClick={() => setShowTranscript((v) => !v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ToolbarButton = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={[
      'text-xs font-medium px-3 py-2 rounded-lg border transition-colors',
      active
        ? 'text-gray-900 border-gray-300 bg-gray-50'
        : 'text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50/50',
    ].join(' ')}
  >
    {label}
  </button>
);
