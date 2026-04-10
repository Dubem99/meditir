'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Badge, sessionStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { ConsultationSession, SOAPNote } from '@/types/entities.types';
import { format } from 'date-fns';

export default function PatientDashboard() {
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [notes, setNotes] = useState<(SOAPNote & { session: { scheduledAt: string; doctor: { firstName: string; lastName: string; specialization: string } } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(true);

  useEffect(() => {
    api.get('/sessions?limit=5')
      .then((r) => setSessions(r.data.data || []))
      .finally(() => setLoading(false));

    api.get('/soap-notes/my-notes')
      .then((r) => setNotes(r.data.data || []))
      .catch(() => {})
      .finally(() => setNotesLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Health Records</h1>
        <p className="text-gray-500 text-sm">View your consultations and clinical notes</p>
      </div>

      {/* Finalized Notes */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">My Clinical Notes</h2>
          <span className="text-xs text-gray-400">{notes.length} finalized</span>
        </div>
        {notesLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : notes.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">No finalized notes yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {notes.map((n) => (
              <div key={n.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm">
                    Dr. {n.session.doctor.firstName} {n.session.doctor.lastName}
                    <span className="text-gray-500 font-normal"> · {n.session.doctor.specialization}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {format(new Date(n.session.scheduledAt), 'MMMM d, yyyy')}
                  </p>
                  <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 italic">"{n.assessment}"</p>
                </div>
                <Link href={`/patient/notes/${n.id}`} className="shrink-0">
                  <Button size="sm" variant="secondary">View Note</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Consultations */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Consultations</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : sessions.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">No consultations yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {sessions.map((s) => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    Dr. {s.doctor.firstName} {s.doctor.lastName}
                    <span className="text-gray-500 font-normal"> · {s.doctor.specialization}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{format(new Date(s.scheduledAt), 'MMM d, yyyy · h:mm a')}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={sessionStatusBadge(s.status)}>{s.status.replace('_', ' ')}</Badge>
                  {s.soapNote && s.soapNote.status === 'FINALIZED' && (
                    <Link href={`/patient/notes/${s.soapNote.id}`}>
                      <Button size="sm" variant="secondary">View Note</Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
