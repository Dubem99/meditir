'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, sessionStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { ConsultationSession } from '@/types/entities.types';
import { format } from 'date-fns';

export default function DoctorSessionsPage() {
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sessions').then((r) => setSessions(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
      </div>

      <Card padding="none">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : sessions.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">No sessions yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Patient', 'Scheduled', 'Status', 'SOAP Note', 'Action'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{s.patient.firstName} {s.patient.lastName}</p>
                    <p className="text-xs text-gray-500">{s.patient.medicalRecordNo || '—'}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {format(new Date(s.scheduledAt), 'MMM d, yyyy h:mm a')}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={sessionStatusBadge(s.status)}>
                      {s.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {s.soapNote ? (
                      <Badge variant={s.soapNote.status === 'FINALIZED' ? 'success' : 'info'}>
                        {s.soapNote.status.replace('_', ' ')}
                      </Badge>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/doctor/sessions/${s.id}`}>
                      <Button size="sm" variant={s.status === 'IN_PROGRESS' ? 'primary' : 'secondary'}>
                        {s.status === 'SCHEDULED' ? 'Start' : s.status === 'IN_PROGRESS' ? 'Rejoin' : 'View'}
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
