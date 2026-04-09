'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { NewConsultationModal } from '@/components/transcription/NewConsultationModal';
import type { ConsultationSession } from '@/types/entities.types';
import { format, isToday, isYesterday } from 'date-fns';

const groupByDate = (sessions: ConsultationSession[]) => {
  const groups: Record<string, ConsultationSession[]> = {};
  for (const s of sessions) {
    const d = new Date(s.scheduledAt);
    const key = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMMM d, yyyy');
    groups[key] = [...(groups[key] || []), s];
  }
  return groups;
};

const statusStyle: Record<string, string> = {
  COMPLETED: 'text-emerald-600 bg-emerald-50',
  IN_PROGRESS: 'text-amber-600 bg-amber-50',
  SCHEDULED: 'text-blue-600 bg-blue-50',
  CANCELLED: 'text-gray-500 bg-gray-100',
};

export default function DoctorSessionsPage() {
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get('/sessions').then((r) => setSessions(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const grouped = groupByDate(sessions);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All Notes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium text-sm shadow-sm transition-colors"
        >
          + New Consultation
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-sm">No consultations yet</p>
          <button onClick={() => setShowModal(true)} className="mt-3 text-sm text-primary-600 font-medium hover:underline">
            Start your first consultation
          </button>
        </div>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">{date}</p>
            <div className="flex flex-col gap-2">
              {items.map((s) => (
                <Link
                  key={s.id}
                  href={`/doctor/sessions/${s.id}`}
                  className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-primary-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
                      {s.patient.firstName[0]}{s.patient.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors">
                        {s.patient.firstName} {s.patient.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {format(new Date(s.scheduledAt), 'h:mm a')}
                        {s.soapNote && ' · Note generated'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[s.status] ?? statusStyle.SCHEDULED}`}>
                      {s.status === 'COMPLETED' ? 'Note ready' : s.status.replace('_', ' ')}
                    </span>
                    <svg className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}

      {showModal && <NewConsultationModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
