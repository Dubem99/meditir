'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { format } from 'date-fns';
import type { ConsultationSession } from '@/types/entities.types';

const statusStyle: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: 'Completed', color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-700 bg-amber-50 border-amber-100' },
  SCHEDULED: { label: 'Scheduled', color: 'text-blue-700 bg-blue-50 border-blue-100' },
  CANCELLED: { label: 'Cancelled', color: 'text-gray-500 bg-gray-100 border-gray-200' },
};

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    const qs = filter ? `?status=${filter}&limit=50` : '?limit=50';
    api.get(`/sessions${qs}`)
      .then((r) => {
        setSessions(r.data.data || []);
        setTotal(r.data.meta?.total || 0);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Sessions</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: '', label: 'All' },
          { value: 'IN_PROGRESS', label: 'In Progress' },
          { value: 'COMPLETED', label: 'Completed' },
          { value: 'SCHEDULED', label: 'Scheduled' },
          { value: 'CANCELLED', label: 'Cancelled' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              filter === f.value
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No sessions found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Patient', 'Doctor', 'Date & Time', 'Status', 'Note'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((s) => {
                const st = statusStyle[s.status] ?? statusStyle.SCHEDULED;
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0">
                          {s.patient.firstName[0]}{s.patient.lastName[0]}
                        </div>
                        <span className="font-medium text-gray-900">
                          {s.patient.firstName} {s.patient.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      Dr. {s.doctor.firstName} {s.doctor.lastName}
                      <span className="text-xs text-gray-400 ml-1.5">· {s.doctor.specialization}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">
                      {format(new Date(s.scheduledAt), 'MMM d, yyyy · h:mm a')}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {s.soapNote ? (
                        <span className="text-xs text-emerald-600 font-medium">
                          {s.soapNote.status === 'FINALIZED' ? 'Signed' : 'Draft'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
