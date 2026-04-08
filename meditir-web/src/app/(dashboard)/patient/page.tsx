'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Card } from '@/components/ui/Card';
import { Badge, sessionStatusBadge, noteStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { ConsultationSession, SOAPNote } from '@/types/entities.types';
import { format } from 'date-fns';

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [notes, setNotes] = useState<SOAPNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We'd normally get the patient ID from the user profile
    // For now load recent sessions + notes
    Promise.all([
      api.get('/sessions?limit=5'),
    ]).then(([s]) => {
      setSessions(s.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Health Records</h1>
        <p className="text-gray-500 text-sm">View your consultations and notes</p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Consultations</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : sessions.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">No consultations yet</p>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    Dr. {s.doctor.firstName} {s.doctor.lastName}
                    <span className="text-gray-500 font-normal"> · {s.doctor.specialization}</span>
                  </p>
                  <p className="text-sm text-gray-500">{format(new Date(s.scheduledAt), 'MMMM d, yyyy h:mm a')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={sessionStatusBadge(s.status)}>{s.status.replace('_', ' ')}</Badge>
                  {s.soapNote && (
                    <Link href={`/patient/notes/${s.soapNote.id}`}>
                      <Button size="sm" variant="secondary">View Note</Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
