'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { NewConsultationModal } from '@/components/transcription/NewConsultationModal';
import { Spinner } from '@/components/ui/Spinner';
import type { ConsultationSession } from '@/types/entities.types';
import { format, isToday, isYesterday } from 'date-fns';
import Link from 'next/link';

const formatSessionDate = (dateStr: string) => {
  const d = new Date(dateStr);
  if (isToday(d)) return `Today, ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday, ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d · h:mm a');
};

const statusLabel: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: 'Note ready', color: 'text-emerald-600 bg-emerald-50' },
  IN_PROGRESS: { label: 'In progress', color: 'text-amber-600 bg-amber-50' },
  SCHEDULED: { label: 'Scheduled', color: 'text-blue-600 bg-blue-50' },
  CANCELLED: { label: 'Cancelled', color: 'text-gray-500 bg-gray-100' },
};

export default function DoctorDashboard() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get('/sessions?limit=20').then((r) => {
      setSessions(r.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const completed = sessions.filter((s) => s.status === 'COMPLETED').length;
  const today = sessions.filter((s) => isToday(new Date(s.scheduledAt))).length;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, Doctor
          </h1>
          <p className="text-gray-500 mt-1 text-sm">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-medium text-sm shadow-sm transition-colors shrink-0"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
          <span className="hidden sm:inline">New Consultation</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {[
          { label: 'Today', value: today },
          { label: 'Notes', value: completed, fullLabel: 'Notes Generated' },
          { label: 'Total', value: sessions.length, fullLabel: 'Total Sessions' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 px-3 sm:px-5 py-3 sm:py-4">
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
              <span className="sm:hidden">{stat.label}</span>
              <span className="hidden sm:inline">{stat.fullLabel ?? stat.label}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Recent consultations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Recent Consultations</h2>
          <Link href="/doctor/sessions" className="text-sm text-primary-600 hover:text-primary-800 font-medium">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="h-6 w-6 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No consultations yet</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-sm text-primary-600 font-medium hover:underline"
            >
              Start your first consultation
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((s) => {
              const st = statusLabel[s.status] ?? statusLabel.SCHEDULED;
              return (
                <Link
                  key={s.id}
                  href={`/doctor/sessions/${s.id}`}
                  className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 md:px-5 py-3 md:py-4 hover:border-primary-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
                      {s.patient.firstName[0]}{s.patient.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 group-hover:text-primary-700 transition-colors truncate">
                        {s.patient.firstName} {s.patient.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatSessionDate(s.scheduledAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${st.color}`}>
                      {st.label}
                    </span>
                    <svg className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {showModal && <NewConsultationModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
