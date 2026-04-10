'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { NewConsultationModal } from '@/components/transcription/NewConsultationModal';
import type { ConsultationSession } from '@/types/entities.types';
import { format, isToday, isYesterday } from 'date-fns';

const formatDuration = (startedAt?: string, endedAt?: string) => {
  if (!startedAt || !endedAt) return null;
  const mins = Math.round((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000);
  if (mins < 1) return '<1 min';
  return `${mins} min`;
};

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
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = (q = '') => {
    setLoading(true);
    const qs = q ? `?search=${encodeURIComponent(q)}` : '';
    api.get(`/sessions${qs}`).then((r) => setSessions(r.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    load(searchInput);
  };

  const handleClear = () => {
    setSearchInput('');
    setSearch('');
    load('');
  };

  const grouped = groupByDate(sessions);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">All Notes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium text-sm shadow-sm transition-colors shrink-0"
        >
          + New
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by patient name…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button type="submit" className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">Search</button>
        {search && <button type="button" onClick={handleClear} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">Clear</button>}
      </form>

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
                      <p className="text-xs text-gray-500 mt-0.5">
                        {format(new Date(s.scheduledAt), 'h:mm a')}
                        {formatDuration(s.startedAt, s.endedAt) && ` · ${formatDuration(s.startedAt, s.endedAt)}`}
                        {s.soapNote && ' · Note ready'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyle[s.status] ?? statusStyle.SCHEDULED}`}>
                      {s.status === 'COMPLETED' ? 'Note ready' : s.status.replace('_', ' ')}
                    </span>
                    <svg className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
