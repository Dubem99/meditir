'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { TranscriptionRoom } from '@/components/transcription/TranscriptionRoom';
import { SOAPNoteCard } from '@/components/soap-notes/SOAPNoteCard';
import { TTSPlayer } from '@/components/tts/TTSPlayer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
  const [view, setView] = useState<'room' | 'note'>('room');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/sessions/${sessionId}`);
        const s: ConsultationSession = res.data.data;
        setSession(s);

        if (s.status === 'SCHEDULED') {
          // Auto-start the session
          const startRes = await api.post(`/sessions/${sessionId}/start`);
          setSession(startRes.data.data);
          setActiveSession(sessionId, startRes.data.data.roomToken);
        } else if (s.status === 'IN_PROGRESS' && s.roomToken) {
          setActiveSession(sessionId, s.roomToken);
        } else if (s.status === 'COMPLETED' && s.soapNote) {
          const noteRes = await api.get(`/soap-notes/${s.soapNote.id}`);
          setSOAPNote(noteRes.data.data);
          setView('note');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => clearSession();
  }, [sessionId]);

  const handleSessionEnd = async (sid: string) => {
    clearSession();
    // Poll for SOAP note
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
      if (attempts > 10) clearInterval(poll);
    }, 2000);
  };

  const handleFinalizeNote = async () => {
    if (!soapNote) return;
    try {
      const res = await api.post(`/soap-notes/${soapNote.id}/finalize`);
      setSOAPNote(res.data.data);
    } catch (err) {
      alert('Failed to finalize note');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return <p className="text-center text-gray-500">Session not found.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/doctor/sessions')}>
          ← Back
        </Button>
        {session.status === 'COMPLETED' && (
          <div className="flex gap-2">
            <Button variant={view === 'room' ? 'primary' : 'secondary'} size="sm" onClick={() => setView('room')}>
              Transcript
            </Button>
            <Button variant={view === 'note' ? 'primary' : 'secondary'} size="sm" onClick={() => setView('note')}>
              SOAP Note
            </Button>
          </div>
        )}
      </div>

      {view === 'room' && session.status === 'IN_PROGRESS' && (
        <TranscriptionRoom session={session} onSessionEnd={handleSessionEnd} />
      )}

      {view === 'note' && soapNote && (
        <Card>
          <SOAPNoteCard
            note={soapNote}
            showActions
            onFinalize={soapNote.status !== 'FINALIZED' ? handleFinalizeNote : undefined}
          />
          {soapNote.status === 'FINALIZED' && (
            <div className="mt-4">
              <TTSPlayer noteId={soapNote.id} cachedAudioUrl={soapNote.ttsAudioUrl} />
            </div>
          )}
        </Card>
      )}

      {session.status === 'COMPLETED' && !soapNote && (
        <Card>
          <div className="flex items-center justify-center gap-3 py-8">
            <Spinner />
            <p className="text-gray-500">Generating SOAP note...</p>
          </div>
        </Card>
      )}
    </div>
  );
}
