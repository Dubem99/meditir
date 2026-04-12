'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { Patient, Doctor } from '@/types/entities.types';

interface Props {
  onClose: () => void;
  onScheduled?: () => void;
}

export const ScheduleConsultationModal = ({ onClose, onScheduled }: Props) => {
  const [step, setStep] = useState<'patient' | 'doctor' | 'when'>('patient');

  const [patient, setPatient] = useState<Patient | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Default to "in 1 hour, rounded to next 15 min"
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
    now.setSeconds(0);
    now.setMilliseconds(0);
    const tz = now.getTimezoneOffset() * 60000;
    const local = new Date(now.getTime() - tz).toISOString().slice(0, 16);
    setScheduledAt(local);
  }, []);

  const submit = async () => {
    if (!patient || !doctor || !scheduledAt) {
      setError('Patient, doctor, and date/time are all required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/sessions', {
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt: new Date(scheduledAt).toISOString(),
        dialect: 'NIGERIAN_ENGLISH',
        notes: notes.trim() || undefined,
      });
      onScheduled?.();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to schedule consultation');
      setSubmitting(false);
    }
  };

  const canSubmit = patient && doctor && scheduledAt && !submitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Schedule Consultation</h2>
            <p className="text-sm text-gray-500 mt-0.5">Assign a patient to a doctor at a specific time</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1 px-6 py-3 border-b border-gray-100 bg-gray-50">
          {(['patient', 'doctor', 'when'] as const).map((s, i) => {
            const isActive = step === s;
            const isDone =
              (s === 'patient' && patient) ||
              (s === 'doctor' && doctor) ||
              (s === 'when' && scheduledAt && step === 'when');
            return (
              <div key={s} className="flex items-center flex-1">
                <button
                  onClick={() => setStep(s)}
                  className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-white border border-primary-300 text-primary-700'
                      : isDone
                      ? 'text-green-700 hover:bg-green-50'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : isDone
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isDone && !isActive ? '✓' : i + 1}
                  </span>
                  <span className="truncate">
                    {s === 'patient' ? 'Patient' : s === 'doctor' ? 'Doctor' : 'When'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* PATIENT STEP */}
          {step === 'patient' && (
            <PatientStep
              selected={patient}
              onSelect={(p) => {
                setPatient(p);
                setStep('doctor');
              }}
            />
          )}

          {/* DOCTOR STEP */}
          {step === 'doctor' && (
            <DoctorStep
              selected={doctor}
              onSelect={(d) => {
                setDoctor(d);
                setStep('when');
              }}
            />
          )}

          {/* WHEN STEP */}
          {step === 'when' && (
            <div className="p-6 space-y-4">
              {/* Summary */}
              {patient && doctor && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-semibold text-xs shrink-0">
                      {patient.firstName[0]}
                      {patient.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {patient.firstName} {patient.lastName}
                      </p>
                      {patient.medicalRecordNo && (
                        <p className="text-xs text-gray-400 font-mono">{patient.medicalRecordNo}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setStep('patient')}
                      className="text-xs text-primary-600 hover:text-primary-700 shrink-0"
                    >
                      Change
                    </button>
                  </div>
                  <div className="flex items-start gap-3 pt-2 border-t border-gray-200">
                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0">
                      {doctor.firstName[0]}
                      {doctor.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{doctor.specialization}</p>
                    </div>
                    <button
                      onClick={() => setStep('doctor')}
                      className="text-xs text-primary-600 hover:text-primary-700 shrink-0"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date &amp; time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Reason for visit, special instructions, etc."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          {step === 'when' ? (
            <Button onClick={submit} loading={submitting} disabled={!canSubmit}>
              Schedule consultation
            </Button>
          ) : (
            <p className="text-xs text-gray-400">
              Step {step === 'patient' ? '1' : '2'} of 3
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────
// PATIENT STEP
// ────────────────────────────────────────────────

const PatientStep = ({
  selected,
  onSelect,
}: {
  selected: Patient | null;
  onSelect: (p: Patient) => void;
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [searching, setSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await api.get(`/patients?limit=10&search=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        setResults(res.data.data || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="p-6">
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, phone, or record no…"
          autoFocus
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
        />
      </div>

      <div className="mt-4 space-y-1.5 min-h-[200px]">
        {query.trim().length < 2 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-400">Start typing to find a patient</p>
          </div>
        ) : searching ? (
          <div className="py-12 text-center">
            <Spinner size="md" />
          </div>
        ) : results.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-500">No patients found for &ldquo;{query}&rdquo;</p>
          </div>
        ) : (
          results.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                selected?.id === p.id
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-gray-100 hover:border-primary-300 hover:bg-primary-50/30'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-semibold text-xs shrink-0">
                {p.firstName[0]}
                {p.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {p.firstName} {p.lastName}
                </p>
                <div className="flex flex-wrap gap-x-3 text-xs text-gray-500 mt-0.5">
                  {p.medicalRecordNo && <span className="font-mono">{p.medicalRecordNo}</span>}
                  {p.phone && <span>{p.phone}</span>}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────
// DOCTOR STEP
// ────────────────────────────────────────────────

const DoctorStep = ({
  selected,
  onSelect,
}: {
  selected: Doctor | null;
  onSelect: (d: Doctor) => void;
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api
      .get('/doctors?limit=100')
      .then((res) => setDoctors(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = query.trim()
    ? doctors.filter((d) => {
        const needle = query.trim().toLowerCase();
        return (
          d.firstName.toLowerCase().includes(needle) ||
          d.lastName.toLowerCase().includes(needle) ||
          d.specialization?.toLowerCase().includes(needle)
        );
      })
    : doctors;

  return (
    <div className="p-6">
      {doctors.length > 5 && (
        <div className="relative mb-4">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name or specialization…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
          />
        </div>
      )}

      <div className="space-y-1.5 min-h-[200px]">
        {loading ? (
          <div className="py-12 text-center">
            <Spinner size="md" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-500">
              {doctors.length === 0 ? 'No doctors onboarded yet' : 'No matches'}
            </p>
          </div>
        ) : (
          filtered.map((d) => (
            <button
              key={d.id}
              onClick={() => onSelect(d)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                selected?.id === d.id
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-gray-100 hover:border-primary-300 hover:bg-primary-50/30'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0">
                {d.firstName[0]}
                {d.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  Dr. {d.firstName} {d.lastName}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{d.specialization}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
