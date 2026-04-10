'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { TranscriptionRoom } from '@/components/transcription/TranscriptionRoom';
import { SOAPNoteCard } from '@/components/soap-notes/SOAPNoteCard';
import { ExtractionsPanel } from '@/components/soap-notes/ExtractionsPanel';
import { TTSPlayer } from '@/components/tts/TTSPlayer';
import { Spinner } from '@/components/ui/Spinner';
import { useSessionStore } from '@/store/session.store';
import type { ConsultationSession, Doctor, SOAPNote, EhrExtractions } from '@/types/entities.types';
import { format } from 'date-fns';

const formatDuration = (startedAt?: string, endedAt?: string) => {
  if (!startedAt || !endedAt) return null;
  const mins = Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000);
  return mins < 1 ? '<1 min' : `${mins} min`;
};

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const setActiveSession = useSessionStore((s) => s.setActiveSession);
  const clearSession = useSessionStore((s) => s.clearSession);

  const [session, setSession] = useState<ConsultationSession | null>(null);
  const [soapNote, setSOAPNote] = useState<SOAPNote | null>(null);
  const [extractions, setExtractions] = useState<EhrExtractions | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'room' | 'note' | 'ehr' | 'generating' | 'generate-failed'>('room');
  const [retrying, setRetrying] = useState(false);

  // Handover state
  const [showHandover, setShowHandover] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [handoverDoctorId, setHandoverDoctorId] = useState('');
  const [handoverNote, setHandoverNote] = useState('');
  const [handingOver, setHandingOver] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const demoData = localStorage.getItem(`demo-session-${sessionId}`);
        if (demoData) {
          const s = JSON.parse(demoData) as ConsultationSession;
          setSession(s);
          setActiveSession(sessionId, 'demo-room');
          setLoading(false);
          return;
        }

        const res = await api.get(`/sessions/${sessionId}`);
        const s: ConsultationSession = res.data.data;
        setSession(s);

        if (s.status === 'SCHEDULED') {
          const startRes = await api.post(`/sessions/${sessionId}/start`);
          setSession(startRes.data.data);
          setActiveSession(sessionId, startRes.data.data.roomToken);
        } else if (s.status === 'IN_PROGRESS' && s.roomToken) {
          setActiveSession(sessionId, s.roomToken);
        } else if (s.status === 'COMPLETED') {
          if (s.soapNote?.id) {
            const noteRes = await api.get(`/soap-notes/${s.soapNote.id}`);
            setSOAPNote(noteRes.data.data);
            setView('note');
          } else {
            setView('generating');
          }
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => clearSession();
  }, [sessionId]);

  // Fetch structured extractions whenever we have a SOAP note (skip demo sessions)
  useEffect(() => {
    if (!soapNote?.id || soapNote.id.startsWith('demo-')) {
      setExtractions(null);
      return;
    }
    let cancelled = false;
    api
      .get(`/ehr-extractions/session/${sessionId}`)
      .then((res) => {
        if (!cancelled) setExtractions(res.data.data);
      })
      .catch(() => {
        if (!cancelled) setExtractions({ soapNoteId: soapNote.id, problems: [], orders: [], billingCodes: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [soapNote?.id, sessionId]);

  const handleSessionEnd = (sid: string) => {
    clearSession();
    setView('generating');

    const demoData = localStorage.getItem(`demo-session-${sid}`);
    if (demoData) {
      setTimeout(() => {
        const mockNote: SOAPNote = {
          id: 'demo-note-1', sessionId: sid, hospitalId: 'demo', patientId: 'p1',
          subjective: 'Patient reports a 3-day history of fever, sore throat, and mild headache.',
          objective: 'Temperature: 38.2°C. Throat: erythematous tonsils. Cervical lymphadenopathy noted.',
          assessment: 'Acute tonsillopharyngitis, likely bacterial (Group A Streptococcus).',
          plan: '1. Amoxicillin 500mg TDS × 7 days.\n2. Paracetamol 1g PRN.\n3. Adequate hydration.\n4. Return if no improvement in 48 hours.',
          status: 'AI_GENERATED', aiModel: 'claude-sonnet-4-6',
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        };
        setSOAPNote(mockNote);
        setView('note');
      }, 3000);
      return;
    }

    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const sessionRes = await api.get(`/sessions/${sid}`);
        const updated = sessionRes.data.data as ConsultationSession;
        if (updated.soapNote?.id) {
          const noteRes = await api.get(`/soap-notes/${updated.soapNote.id}`);
          setSOAPNote(noteRes.data.data);
          setSession(updated);
          setView('note');
          clearInterval(poll);
        }
      } catch {}
      if (attempts > 15) { clearInterval(poll); setView('generate-failed'); }
    }, 2000);
  };

  const handleRetryGenerate = async () => {
    setRetrying(true);
    setView('generating');
    try { await api.post('/soap-notes/generate', { sessionId }); } catch {}
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const sessionRes = await api.get(`/sessions/${sessionId}`);
        const updated = sessionRes.data.data as ConsultationSession;
        if (updated.soapNote?.id) {
          const noteRes = await api.get(`/soap-notes/${updated.soapNote.id}`);
          setSOAPNote(noteRes.data.data);
          setSession(updated);
          setView('note');
          clearInterval(poll);
        }
      } catch {}
      if (attempts > 15) { clearInterval(poll); setView('generate-failed'); }
    }, 2000);
    setRetrying(false);
  };

  const handleFinalizeNote = async () => {
    if (!soapNote) return;
    const res = await api.post(`/soap-notes/${soapNote.id}/finalize`);
    setSOAPNote(res.data.data);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const openHandover = async () => {
    if (doctors.length === 0) {
      const res = await api.get('/doctors?limit=100');
      setDoctors((res.data.data || []).filter((d: Doctor) => d.id !== session?.doctorId));
    }
    setShowHandover(true);
  };

  const handleHandover = async () => {
    if (!handoverDoctorId) return;
    setHandingOver(true);
    try {
      const res = await api.post(`/sessions/${sessionId}/handover`, {
        toDoctorId: handoverDoctorId,
        handoverNote,
      });
      setSession(res.data.data);
      setShowHandover(false);
      router.push('/doctor');
    } catch {
      setHandingOver(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  }
  if (!session) {
    return <div className="text-center py-16 text-gray-500">Session not found.</div>;
  }

  const duration = formatDuration(session.startedAt, session.endedAt);
  const drugWarnings: string[] = soapNote?.drugWarnings ? JSON.parse(soapNote.drugWarnings) : [];

  return (
    <>
      <div className="max-w-3xl mx-auto print:max-w-none">
        {/* Back */}
        <button
          onClick={() => router.push('/doctor')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors print:hidden"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to dashboard
        </button>

        {/* Session meta */}
        {session.status === 'COMPLETED' && (
          <div className="flex items-center gap-3 mb-4 text-xs text-gray-500 print:hidden">
            {duration && (
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {duration}
              </span>
            )}
            {session.endedAt && (
              <span>{format(new Date(session.endedAt), 'MMM d, yyyy · h:mm a')}</span>
            )}
            {session.handoverNote && (
              <span className="text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Handed over
              </span>
            )}
          </div>
        )}

        {/* Tab switcher */}
        {session.status === 'COMPLETED' && soapNote && (
          <div className="flex items-center justify-between mb-6 print:hidden">
            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
              {(['room', 'note', 'ehr'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {v === 'room' ? 'Transcript' : v === 'note' ? 'Clinical Note' : 'Structured Data'}
                </button>
              ))}
            </div>
            {view === 'note' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export PDF
                </button>
                {session.status !== 'COMPLETED' || !soapNote?.doctorSignedAt ? null : null}
              </div>
            )}
          </div>
        )}

        {/* Handover button — only for in-progress or completed unsigned notes */}
        {(session.status === 'IN_PROGRESS' || (session.status === 'COMPLETED' && soapNote && soapNote.status !== 'FINALIZED')) && (
          <div className="mb-4 print:hidden">
            <button
              onClick={openHandover}
              className="flex items-center gap-2 px-3 py-1.5 border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Hand Over to Colleague
            </button>
          </div>
        )}

        {/* Drug warnings */}
        {drugWarnings.length > 0 && view === 'note' && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 print:block">
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-4 w-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-amber-800">Drug Interaction Alerts</span>
            </div>
            <ul className="space-y-1">
              {drugWarnings.map((w, i) => (
                <li key={i} className="text-sm text-amber-700 flex gap-2">
                  <span className="shrink-0">·</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recording view */}
        {view === 'room' && session.status === 'IN_PROGRESS' && (
          <TranscriptionRoom session={session} onSessionEnd={handleSessionEnd} />
        )}

        {/* Transcript view for completed session */}
        {view === 'room' && session.status === 'COMPLETED' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-900">Consultation Transcript</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {session.transcriptions?.length
                    ? `${session.transcriptions.length} segment${session.transcriptions.length !== 1 ? 's' : ''}`
                    : 'No transcript recorded'}
                </p>
              </div>
              {session.transcriptions && session.transcriptions.length > 0 && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
                  {session.dialect?.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            {!session.transcriptions || session.transcriptions.length === 0 ? (
              <div className="text-center py-10">
                <svg className="h-10 w-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-7a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <p className="text-sm text-gray-400">No transcript segments were recorded for this session.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {session.transcriptions.map((t, i) => (
                  <div key={t.id} className="flex gap-3 group">
                    {/* Timestamp bubble */}
                    <div className="shrink-0 pt-0.5">
                      {t.startMs != null ? (
                        <span className="inline-block text-[10px] font-mono text-gray-400 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5 min-w-[44px] text-center tabular-nums">
                          {Math.floor(t.startMs / 60000)}:{String(Math.floor((t.startMs % 60000) / 1000)).padStart(2, '0')}
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-mono text-gray-300 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5 min-w-[44px] text-center tabular-nums">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    {/* Speaker + text */}
                    <div className="flex-1 min-w-0">
                      {t.speakerTag && (
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
                          {t.speakerTag}
                        </p>
                      )}
                      <p className="text-sm text-gray-800 leading-relaxed">{t.text}</p>
                      {t.confidence != null && t.confidence < 0.7 && (
                        <p className="text-[10px] text-amber-500 mt-0.5">Low confidence</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Generating state */}
        {view === 'generating' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Spinner size="lg" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Generating Clinical Note</h3>
            <p className="text-sm text-gray-500">
              Claude AI is analyzing the consultation transcript and generating your SOAP note. This takes about 30 seconds.
            </p>
          </div>
        )}

        {/* Generation failed state */}
        {view === 'generate-failed' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Note Generation Timed Out</h3>
            <p className="text-sm text-gray-500 mb-6">The SOAP note is taking longer than expected. You can retry or generate it manually.</p>
            <button
              onClick={handleRetryGenerate}
              disabled={retrying}
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {retrying ? 'Retrying…' : 'Generate Note'}
            </button>
          </div>
        )}

        {/* Structured data view */}
        {view === 'ehr' && soapNote && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            {extractions ? (
              <ExtractionsPanel
                sessionId={sessionId}
                extractions={extractions}
                onChange={setExtractions}
                readOnly={soapNote.status === 'FINALIZED'}
              />
            ) : (
              <div className="py-10 text-center">
                <Spinner size="md" />
                <p className="text-sm text-gray-400 mt-3">Loading structured data…</p>
              </div>
            )}
          </div>
        )}

        {/* SOAP note view */}
        {view === 'note' && soapNote && (
          <div id="print-area" className="bg-white rounded-2xl border border-gray-200 p-6">
            {/* Print header */}
            <div className="hidden print:block mb-6 pb-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900">Clinical Note — {session.patient.firstName} {session.patient.lastName}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Dr. {session.doctor.firstName} {session.doctor.lastName} · {session.doctor.specialization}
                {session.endedAt && ` · ${format(new Date(session.endedAt), 'MMMM d, yyyy')}`}
                {duration && ` · Duration: ${duration}`}
              </p>
            </div>
            <SOAPNoteCard
              note={soapNote}
              showActions
              onFinalize={soapNote.status !== 'FINALIZED' ? handleFinalizeNote : undefined}
            />
            {soapNote.status === 'FINALIZED' && (
              <div className="mt-6 pt-6 border-t border-gray-100 print:hidden">
                <TTSPlayer noteId={soapNote.id} cachedAudioUrl={soapNote.ttsAudioUrl} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Handover Modal */}
      {showHandover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowHandover(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Hand Over Session</h2>
            <p className="text-sm text-gray-500 mb-5">Transfer this session to another doctor. They will take over care immediately.</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Doctor</label>
                <select
                  value={handoverDoctorId}
                  onChange={(e) => setHandoverDoctorId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="">Choose a doctor…</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.firstName} {d.lastName} — {d.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Handover Note</label>
                <textarea
                  value={handoverNote}
                  onChange={(e) => setHandoverNote(e.target.value)}
                  placeholder="Brief summary of current status, pending actions, concerns…"
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowHandover(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleHandover}
                  disabled={!handoverDoctorId || handingOver}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  {handingOver ? 'Handing over…' : 'Confirm Handover'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
