'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { TranscriptionRoom } from '@/components/transcription/TranscriptionRoom';
import { SOAPNoteCard } from '@/components/soap-notes/SOAPNoteCard';
import { TTSPlayer } from '@/components/tts/TTSPlayer';
import { Spinner } from '@/components/ui/Spinner';
import { useSessionStore } from '@/store/session.store';
import type { ConsultationSession, SOAPNote } from '@/types/entities.types';

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const setActiveSession = useSessionStore((s) => s.setActiveSession);
  const clearSession = useSessionStore((s) => s.clearSession);

  const [session, setSession] = useState<ConsultationSession | null>(null);
  const [soapNote, setSOAPNote] = useState<SOAPNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'room' | 'note' | 'generating'>('room');

  useEffect(() => {
    const load = async () => {
      try {
        // Demo mode
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

  const handleSessionEnd = (sid: string) => {
    clearSession();
    setView('generating');

    // Demo mode — generate a mock SOAP note after 3 seconds
    const demoData = localStorage.getItem(`demo-session-${sid}`);
    if (demoData) {
      setTimeout(() => {
        const mockNote: SOAPNote = {
          id: 'demo-note-1',
          sessionId: sid,
          hospitalId: 'demo',
          patientId: 'p1',
          subjective: 'Patient reports a 3-day history of fever, sore throat, and mild headache. Denies cough or shortness of breath. No known drug allergies.',
          objective: 'Temperature: 38.2°C. Throat: erythematous tonsils with exudate. Lymph nodes: mildly enlarged cervical lymph nodes. Lungs: clear to auscultation bilaterally.',
          assessment: 'Acute tonsillopharyngitis, likely bacterial (Group A Streptococcus). Differential includes viral pharyngitis.',
          plan: '1. Amoxicillin 500mg TDS for 7 days.\n2. Paracetamol 1g PRN for fever and pain.\n3. Adequate hydration and rest.\n4. Return if symptoms worsen or no improvement in 48 hours.\n5. Follow up in 1 week.',
          status: 'AI_GENERATED',
          aiModel: 'claude-sonnet-4-6',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
      if (attempts > 15) clearInterval(poll);
    }, 2000);
  };

  const handleFinalizeNote = async () => {
    if (!soapNote) return;
    const res = await api.post(`/soap-notes/${soapNote.id}/finalize`);
    setSOAPNote(res.data.data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-16 text-gray-500">Session not found.</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.push('/doctor')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to dashboard
      </button>

      {/* Tab switcher (only when completed) */}
      {session.status === 'COMPLETED' && soapNote && (
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
          {(['room', 'note'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v === 'room' ? 'Transcript' : 'Clinical Note'}
            </button>
          ))}
        </div>
      )}

      {/* Recording view */}
      {view === 'room' && session.status === 'IN_PROGRESS' && (
        <TranscriptionRoom session={session} onSessionEnd={handleSessionEnd} />
      )}

      {/* Transcript view for completed session */}
      {view === 'room' && session.status === 'COMPLETED' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Transcript</h3>
          <p className="text-sm text-gray-500">Transcript archived. Switch to Clinical Note view.</p>
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

      {/* SOAP note view */}
      {view === 'note' && soapNote && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <SOAPNoteCard
            note={soapNote}
            showActions
            onFinalize={soapNote.status !== 'FINALIZED' ? handleFinalizeNote : undefined}
          />
          {soapNote.status === 'FINALIZED' && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <TTSPlayer noteId={soapNote.id} cachedAudioUrl={soapNote.ttsAudioUrl} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
