'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranscription } from '@/hooks/useTranscription';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useSessionStore } from '@/store/session.store';
import { useAuthStore } from '@/store/auth.store';
import { DialectSelector, dialectChoiceLabel } from './DialectSelector';
import type { DialectChoice } from './DialectSelector';
import { TemplateSelector } from './TemplateSelector';
import type { ConsultationSession, NoteTemplate } from '@/types/entities.types';
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

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const TranscriptionRoom = ({ session, onSessionEnd }: Props) => {
  const [dialect, setDialect] = useState<DialectChoice>(session.dialect);
  const [templateId, setTemplateId] = useState<string>(session.templateId ?? 'general-practice');
  const [templateName, setTemplateName] = useState<string>('General Practice');
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeSheet, setActiveSheet] = useState<'dialect' | 'template' | 'transcript' | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const transcriptions = useSessionStore((s) => s.transcriptions);
  const { isOnline } = useOfflineSync(session.id);
  const authUser = useAuthStore((s) => s.user);
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

  // Friendly greeting using the assigned doctor's first name. Falls back to a
  // generic greeting if we don't have it (e.g. session loaded as admin).
  const doctorFirstName = session.doctor?.firstName ?? '';
  const greeting = doctorFirstName ? `Hello, Dr. ${doctorFirstName}` : 'Ready when you are';

  // Lazy-load the template name once so the toolbar pill shows current value
  // without a network round-trip every interaction.
  useEffect(() => {
    api
      .get('/sessions/templates')
      .then((r) => {
        const list: NoteTemplate[] = r.data.data ?? [];
        const t = list.find((x) => x.id === templateId);
        if (t) setTemplateName(t.name);
      })
      .catch(() => undefined);
  }, [templateId]);

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
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/doctor/patients/${patient.id}`}
            className="text-xl sm:text-2xl font-semibold text-gray-900 hover:text-primary-600 transition-colors break-words"
            title="View full patient history"
          >
            {patient.firstName} {patient.lastName}
          </Link>
          <div className="flex items-center gap-x-2.5 gap-y-1 mt-1 flex-wrap text-sm text-gray-500">
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
          className="bg-gray-900 hover:bg-black disabled:opacity-50 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors shadow-sm shrink-0 whitespace-nowrap"
        >
          {isEndingSession ? 'Ending…' : (
            <>
              <span className="hidden sm:inline">Finish & generate note</span>
              <span className="sm:hidden">Finish</span>
            </>
          )}
        </button>
      </div>

      {/* Allergy / chronic flags — only when present */}
      {hasClinicalFlags && (
        <div className="flex items-center gap-1.5 flex-wrap mb-4 text-xs">
          {allergies.length > 0 && (
            <>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Allergies</span>
              {allergies.map((a) => (
                <span key={a} className="text-red-700 bg-red-50 border border-red-100 rounded-md px-2 py-0.5">
                  {a}
                </span>
              ))}
            </>
          )}
          {chronicConditions.length > 0 && (
            <>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold ml-1">Chronic</span>
              {chronicConditions.map((c) => (
                <span key={c} className="text-purple-700 bg-purple-50 border border-purple-100 rounded-md px-2 py-0.5">
                  {c}
                </span>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── Main stage ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center py-8 sm:py-16 px-4">
        {!isRecording ? (
          <>
            {/* IDLE state — calm greeting + pill Start button */}
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 text-center mb-2">
              {greeting}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mb-10 text-center">
              Press start to begin the consultation
            </p>
            <button
              onClick={startTranscription}
              disabled={!isSupported}
              className="bg-gray-900 hover:bg-black disabled:opacity-40 text-primary-300 hover:text-primary-200 font-medium text-base px-14 py-4 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed"
            >
              Start
            </button>
            {!isSupported && (
              <p className="text-xs text-gray-400 mt-4 text-center max-w-xs">
                Use Chrome, Edge, Safari, or Firefox to record audio
              </p>
            )}
          </>
        ) : isPaused ? (
          <>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] mb-3 ${stateColor}`}>
              {stateLabel}
            </p>
            <p className="text-6xl sm:text-7xl font-light tabular-nums text-amber-700 mb-12">
              {formatTime(elapsed)}
            </p>
            <div className="relative">
              <div className="absolute -inset-3 rounded-full bg-amber-200/40 blur-md" />
              <button
                onClick={resumeTranscription}
                aria-label="Resume recording"
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center shadow-lg transition-all active:scale-95"
              >
                <svg className="h-10 w-10 sm:h-11 sm:w-11 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-6">Tap to resume</p>
          </>
        ) : (
          <>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] mb-3 ${stateColor}`}>
              {stateLabel}
            </p>
            <p className="text-6xl sm:text-7xl font-light tabular-nums text-gray-900 mb-12">
              {formatTime(elapsed)}
            </p>
            <div className="relative">
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
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all active:scale-95"
              >
                <svg className="h-9 w-9 sm:h-10 sm:w-10" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="5" width="4" height="14" rx="1" />
                  <rect x="14" y="5" width="4" height="14" rx="1" />
                </svg>
              </button>
            </div>
            <div className="w-40 sm:w-48 h-[3px] bg-gray-100 rounded-full overflow-hidden mt-8">
              <div
                className="h-full bg-red-500 transition-all duration-75"
                style={{ width: `${Math.round(audioLevel * 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-6">Tap to pause</p>
            <p className="text-[11px] text-gray-400 mt-1.5">
              or press{' '}
              <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">
                Space
              </kbd>
            </p>
          </>
        )}

        {error && (
          <div className="mt-6 max-w-md bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* ── Sheets (above toolbar) ─────────────────────────────────── */}
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

      {activeSheet === 'transcript' && (
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
                  <EditableTranscriptLine
                    key={t.id}
                    transcriptionId={t.id}
                    text={t.text}
                    onUpdated={(newText) =>
                      useSessionStore.getState().updateTranscription(t.id, newText)
                    }
                  />
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

      {/* ── Bottom toolbar — pills with current value ──────────────── */}
      <div className="border-t border-gray-100 pt-3 flex items-center gap-2 flex-wrap">
        <ToolbarPill
          label="Template"
          value={templateName}
          active={activeSheet === 'template'}
          onClick={() => setActiveSheet(activeSheet === 'template' ? null : 'template')}
        />
        <ToolbarPill
          label="Language"
          value={dialectChoiceLabel(dialect)}
          active={activeSheet === 'dialect'}
          onClick={() => setActiveSheet(activeSheet === 'dialect' ? null : 'dialect')}
        />
        <ToolbarPill
          label={transcriptions.length > 0 || interimText ? 'Transcript' : 'Transcript'}
          value={
            activeSheet === 'transcript'
              ? 'Hide'
              : transcriptions.length > 0
              ? `${transcriptions.length}`
              : 'Show'
          }
          active={activeSheet === 'transcript'}
          onClick={() => setActiveSheet(activeSheet === 'transcript' ? null : 'transcript')}
        />
        <span className="hidden sm:inline-block text-[11px] text-gray-300 ml-auto">
          {authUser?.email}
        </span>
      </div>
    </div>
  );
};

const ToolbarPill = ({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={[
      'inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors max-w-[200px]',
      active
        ? 'bg-gray-900 border-gray-900 text-white'
        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300',
    ].join(' ')}
  >
    <span className={active ? 'text-gray-300' : 'text-gray-400'}>{label}:</span>
    <span className="font-medium truncate">{value}</span>
    <ChevronDown className="shrink-0 opacity-60" />
  </button>
);

// Inline-editable transcript line. Click the pencil to edit, save submits to
// the server which logs the edit shape (no PHI text retained for analytics).
const EditableTranscriptLine = ({
  transcriptionId,
  text,
  onUpdated,
}: {
  transcriptionId: string;
  text: string;
  onUpdated: (newText: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(text);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't try to edit local-only segments (offline placeholders).
  const isPersisted = !transcriptionId.startsWith('offline-') && !transcriptionId.startsWith('local-');

  const startEdit = () => {
    if (!isPersisted) return;
    setDraft(text);
    setError(null);
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setDraft(text);
    setError(null);
  };

  const save = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setError('Cannot be empty');
      return;
    }
    if (trimmed === text) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/transcriptions/${transcriptionId}`, { text: trimmed });
      onUpdated(trimmed);
      setEditing(false);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e?.response?.data?.message ?? e?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="group">
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') cancel();
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save();
          }}
          className="w-full text-sm text-gray-800 leading-relaxed bg-white border border-primary-300 rounded-md px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary-100 resize-y min-h-[60px]"
          rows={Math.min(6, Math.max(2, Math.ceil(draft.length / 60)))}
        />
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={save}
            disabled={saving}
            className="text-[11px] font-medium text-primary-700 hover:text-primary-800 disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={cancel}
            disabled={saving}
            className="text-[11px] text-gray-400 hover:text-gray-600"
          >
            Cancel
          </button>
          <span className="text-[10px] text-gray-300 ml-auto">
            ⌘/Ctrl+Enter to save · Esc to cancel
          </span>
        </div>
        {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-2">
      <p className="text-sm text-gray-800 leading-relaxed flex-1">{text}</p>
      {isPersisted && (
        <button
          onClick={startEdit}
          aria-label="Edit transcript line"
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 transition-opacity shrink-0"
          title="Edit"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}
    </div>
  );
};
