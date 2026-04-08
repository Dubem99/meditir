'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge, sessionStatusBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';
import type { ConsultationSession } from '@/types/entities.types';
import { format } from 'date-fns';

export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sessions?limit=10').then((r) => {
      setSessions(r.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const todaySessions = sessions.filter(
    (s) => format(new Date(s.scheduledAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good morning, Doctor</h1>
        <p className="text-gray-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Today's Sessions", value: todaySessions.length },
          { label: 'Upcoming', value: sessions.filter((s) => s.status === 'SCHEDULED').length },
          { label: 'Completed', value: sessions.filter((s) => s.status === 'COMPLETED').length },
        ].map((stat) => (
          <Card key={stat.label} className="text-center">
            <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Today's sessions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Today's Consultations</h2>
          <Link href="/doctor/sessions">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : todaySessions.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">No sessions scheduled today</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {todaySessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">
                    {session.patient.firstName} {session.patient.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(session.scheduledAt), 'h:mm a')}
                    {session.patient.medicalRecordNo && ` · MRN: ${session.patient.medicalRecordNo}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={sessionStatusBadge(session.status)}>
                    {session.status.replace('_', ' ')}
                  </Badge>
                  {session.status === 'SCHEDULED' && (
                    <Link href={`/doctor/sessions/${session.id}`}>
                      <Button size="sm">Start</Button>
                    </Link>
                  )}
                  {session.status === 'IN_PROGRESS' && (
                    <Link href={`/doctor/sessions/${session.id}`}>
                      <Button size="sm" variant="danger">Rejoin</Button>
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
