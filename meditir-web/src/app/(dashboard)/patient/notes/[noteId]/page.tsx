'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { SOAPNoteCard } from '@/components/soap-notes/SOAPNoteCard';
import { TTSPlayer } from '@/components/tts/TTSPlayer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { SOAPNote } from '@/types/entities.types';

export default function PatientNotePage() {
  const { noteId } = useParams<{ noteId: string }>();
  const router = useRouter();
  const [note, setNote] = useState<SOAPNote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/soap-notes/${noteId}`).then((r) => setNote(r.data.data)).finally(() => setLoading(false));
  }, [noteId]);

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (!note) return <p className="text-center text-gray-500">Note not found.</p>;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Back</Button>
        <h1 className="text-xl font-bold text-gray-900">Consultation Note</h1>
      </div>

      <TTSPlayer noteId={noteId} cachedAudioUrl={note.ttsAudioUrl} />

      <Card>
        <SOAPNoteCard note={note} />
      </Card>
    </div>
  );
}
