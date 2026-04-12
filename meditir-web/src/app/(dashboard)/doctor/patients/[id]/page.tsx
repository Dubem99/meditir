'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { PatientChatPanel } from '@/components/patients/PatientChatPanel';
import type { PatientTimeline, ProblemStatus, OrderType } from '@/types/entities.types';

const calculateAge = (dob?: string | null): number | null => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  return Math.floor((Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
};

const problemStatusColor: Record<ProblemStatus, string> = {
  ACTIVE: 'bg-red-50 text-red-700 border-red-200',
  CHRONIC: 'bg-purple-50 text-purple-700 border-purple-200',
  RESOLVED: 'bg-green-50 text-green-700 border-green-200',
  RULE_OUT: 'bg-gray-50 text-gray-600 border-gray-200',
};

const orderTypeColor: Record<OrderType, string> = {
  MEDICATION: 'bg-blue-50 text-blue-700 border-blue-200',
  LAB: 'bg-teal-50 text-teal-700 border-teal-200',
  IMAGING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  PROCEDURE: 'bg-amber-50 text-amber-700 border-amber-200',
  REFERRAL: 'bg-pink-50 text-pink-700 border-pink-200',
};

type Tab = 'timeline' | 'problems' | 'meds' | 'chat';

export default function PatientHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<PatientTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('timeline');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get(`/patients/${id}/timeline`)
      .then((res) => {
        if (!cancelled) setData(res.data.data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        setError(e?.response?.data?.message || e?.message || 'Failed to load patient history');
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <p className="text-gray-500">{error || 'Patient not found'}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 text-sm text-primary-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const { patient, stats, sessions, activeProblems, resolvedProblems, currentMedications, pendingOrders } = data;
  const age = calculateAge(patient.dateOfBirth);
  const allergies = patient.allergies ?? [];
  const chronicConditions = patient.chronicConditions ?? [];

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Back link */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 border border-primary-200 flex items-center justify-center text-primary-700 font-bold text-xl shrink-0">
              {patient.firstName[0]}
              {patient.lastName[0]}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {patient.firstName} {patient.lastName}
              </h1>
              <div className="flex items-center gap-3 mt-1 flex-wrap text-sm text-gray-500">
                {age !== null && <span>{age} yrs</span>}
                {patient.gender && <span>· {patient.gender.toLowerCase().replace(/_/g, ' ')}</span>}
                {patient.medicalRecordNo && (
                  <span className="font-mono text-xs bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                    {patient.medicalRecordNo}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-gray-400">
                {patient.phone && <span>{patient.phone}</span>}
                {patient.user?.email && !patient.user.email.startsWith('guest-') && (
                  <span>{patient.user.email}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {patient.bloodGroup && (
              <div className="text-center px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400 mb-0.5">
                  Blood
                </p>
                <p className="text-sm font-mono font-semibold text-red-700">{patient.bloodGroup}</p>
              </div>
            )}
            {patient.genotype && (
              <div className="text-center px-3 py-2 bg-purple-50 border border-purple-100 rounded-lg">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-400 mb-0.5">
                  Genotype
                </p>
                <p className="text-sm font-mono font-semibold text-purple-700">{patient.genotype}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100">
          {[
            { label: 'Total Visits', value: stats.totalVisits },
            { label: 'Active Problems', value: stats.activeProblems },
            { label: 'Current Meds', value: stats.currentMedications },
            {
              label: 'Last Visit',
              value: stats.lastVisit ? formatDistanceToNow(new Date(stats.lastVisit), { addSuffix: true }) : '—',
            },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {s.label}
              </p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Allergies + chronic conditions banner */}
        {(allergies.length > 0 || chronicConditions.length > 0) && (
          <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                Allergies
              </p>
              {allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {allergies.map((a) => (
                    <span
                      key={a}
                      className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-full px-2 py-0.5 font-medium"
                    >
                      ⚠ {a}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">None documented</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
                Chronic conditions
              </p>
              {chronicConditions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {chronicConditions.map((c) => (
                    <span
                      key={c}
                      className="text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2 py-0.5 font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">None documented</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {(['timeline', 'problems', 'meds', 'chat'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'timeline'
              ? `Timeline (${stats.totalVisits})`
              : t === 'problems'
              ? `Problems (${activeProblems.length})`
              : t === 'meds'
              ? `Medications (${currentMedications.length})`
              : 'Chat'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'timeline' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400">No visits recorded yet for this patient.</p>
            </div>
          ) : (
            <ol className="relative border-l-2 border-gray-100 ml-2 pl-6 space-y-6">
              {sessions.map((s) => {
                const date = new Date(s.scheduledAt);
                const statusColor =
                  s.status === 'COMPLETED'
                    ? 'bg-green-500'
                    : s.status === 'IN_PROGRESS'
                    ? 'bg-amber-500 animate-pulse'
                    : s.status === 'CANCELLED'
                    ? 'bg-gray-300'
                    : 'bg-blue-500';
                return (
                  <li key={s.id} className="relative">
                    <span
                      className={`absolute -left-[33px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow ${statusColor}`}
                    />
                    <Link
                      href={`/doctor/sessions/${s.id}`}
                      className="block hover:bg-gray-50 -mx-3 px-3 py-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {format(date, 'MMMM d, yyyy')}
                            <span className="text-xs text-gray-400 font-normal ml-2">
                              · {format(date, 'h:mm a')}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Dr. {s.doctor.firstName} {s.doctor.lastName} · {s.doctor.specialization}
                          </p>
                          {s.soapNote?.assessment && (
                            <p className="text-sm text-gray-700 mt-2 leading-relaxed line-clamp-2">
                              <span className="font-semibold text-gray-500 text-xs uppercase tracking-wider mr-2">
                                Assessment:
                              </span>
                              {s.soapNote.assessment}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                            s.status === 'COMPLETED'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : s.status === 'IN_PROGRESS'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : s.status === 'CANCELLED'
                              ? 'bg-gray-50 text-gray-500 border border-gray-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {s.status.replace('_', ' ')}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}

      {tab === 'problems' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Active problems ({activeProblems.length})
            </h3>
            {activeProblems.length === 0 ? (
              <p className="text-sm text-gray-400">No active problems.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {activeProblems.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 border rounded-full pl-3 pr-3 py-1.5 text-sm ${problemStatusColor[p.status]}`}
                  >
                    <span className="font-medium">{p.name}</span>
                    {p.icd10Code && <span className="font-mono text-xs opacity-70">{p.icd10Code}</span>}
                    <span className="text-[10px] uppercase tracking-wider opacity-60">
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {resolvedProblems.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Resolved problems ({resolvedProblems.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {resolvedProblems.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 border border-green-200 bg-green-50 text-green-700 rounded-full pl-3 pr-3 py-1.5 text-sm opacity-70"
                  >
                    <span className="font-medium line-through">{p.name}</span>
                    {p.icd10Code && <span className="font-mono text-xs">{p.icd10Code}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {tab === 'meds' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Current medications ({currentMedications.length})
            </h3>
            {currentMedications.length === 0 ? (
              <p className="text-sm text-gray-400">No current medications.</p>
            ) : (
              <div className="space-y-2">
                {currentMedications.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-start gap-3 border border-gray-200 rounded-xl p-3 bg-white"
                  >
                    <span
                      className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider border rounded px-1.5 py-0.5 ${orderTypeColor[o.type]}`}
                    >
                      {o.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{o.name}</p>
                      {(o.dosage || o.frequency || o.duration) && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {[o.dosage, o.frequency, o.duration].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {o.instructions && (
                        <p className="text-xs text-gray-400 mt-0.5 italic">{o.instructions}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {pendingOrders.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Pending labs, imaging & referrals ({pendingOrders.length})
              </h3>
              <div className="space-y-2">
                {pendingOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-start gap-3 border border-gray-200 rounded-xl p-3 bg-white"
                  >
                    <span
                      className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider border rounded px-1.5 py-0.5 ${orderTypeColor[o.type]}`}
                    >
                      {o.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{o.name}</p>
                      {o.instructions && (
                        <p className="text-xs text-gray-400 mt-0.5 italic">{o.instructions}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {tab === 'chat' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <PatientChatPanel patientId={patient.id} />
        </div>
      )}
    </div>
  );
}
