'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { Patient } from '@/types/entities.types';

interface Props {
  onClose: () => void;
}

type Mode = 'search' | 'register';

export const NewConsultationModal = ({ onClose }: Props) => {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('search');

  // --- Demo-mode shortcut (unchanged) ---
  const isDemoMode = () => {
    const stored = localStorage.getItem('meditir-auth');
    return stored ? JSON.parse(stored)?.state?.user?.id === 'demo' : false;
  };

  const startDemoSession = (firstName: string, lastName: string) => {
    const demoSessionId = `demo-session-${Date.now()}`;
    localStorage.setItem(
      `demo-session-${demoSessionId}`,
      JSON.stringify({
        id: demoSessionId,
        patient: { id: 'p1', firstName, lastName, medicalRecordNo: '' },
        status: 'IN_PROGRESS',
        dialect: 'NIGERIAN_ENGLISH',
        roomToken: 'demo-room',
        scheduledAt: new Date().toISOString(),
        doctor: { id: 'd1', firstName: 'Demo', lastName: 'Doctor', specialization: 'General Practice' },
        soapNote: null,
      })
    );
    window.location.href = `/doctor/sessions/${demoSessionId}`;
  };

  const startSessionFor = async (patientId: string) => {
    const res = await api.post('/sessions', {
      patientId,
      dialect: 'NIGERIAN_ENGLISH',
      scheduledAt: new Date().toISOString(),
    });
    router.push(`/doctor/sessions/${res.data.data.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">New Consultation</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {mode === 'search' ? 'Search for an existing patient or register a new one' : 'Register a new patient'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {mode === 'search' ? (
          <SearchView
            onSelect={(p) => startSessionFor(p.id)}
            onNewPatient={() => setMode('register')}
            onDemoStart={(fn, ln) => startDemoSession(fn, ln)}
            isDemo={isDemoMode()}
          />
        ) : (
          <RegisterView
            onBack={() => setMode('search')}
            onRegistered={(p) => startSessionFor(p.id)}
            isDemo={isDemoMode()}
            onDemoStart={(fn, ln) => startDemoSession(fn, ln)}
          />
        )}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────
// SEARCH VIEW
// ──────────────────────────────────────────────────────────

interface SearchViewProps {
  onSelect: (patient: Patient) => void;
  onNewPatient: () => void;
  onDemoStart: (firstName: string, lastName: string) => void;
  isDemo: boolean;
}

const SearchView = ({ onSelect, onNewPatient, onDemoStart, isDemo }: SearchViewProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [searching, setSearching] = useState(false);
  const [startingForId, setStartingForId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  // Debounced search — triggers ~250ms after typing stops
  useEffect(() => {
    if (isDemo) return;
    if (query.trim().length < 2) {
      setResults([]);
      setSearching(false);
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
      } catch (err: unknown) {
        const e = err as { name?: string };
        if (e?.name !== 'CanceledError' && e?.name !== 'AbortError') {
          setResults([]);
        }
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isDemo]);

  const pickPatient = async (patient: Patient) => {
    setStartingForId(patient.id);
    setError('');
    try {
      await Promise.resolve(onSelect(patient));
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: { message?: string } } };
      setError(e2.response?.data?.message || 'Failed to start consultation');
      setStartingForId(null);
    }
  };

  // Demo mode — keep old simple form
  if (isDemo) {
    return <DemoQuickForm onStart={onDemoStart} />;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Search input */}
      <div className="px-6 py-4">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
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
      </div>

      {error && (
        <div className="mx-6 mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Results */}
      <div className="px-6 pb-3 min-h-[200px]">
        {query.trim().length < 2 ? (
          <div className="py-12 text-center">
            <svg className="h-10 w-10 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-sm text-gray-400">Start typing to find a patient</p>
            <p className="text-xs text-gray-400 mt-1">Name, email, phone number, or medical record number</p>
          </div>
        ) : searching ? (
          <div className="py-12 text-center">
            <Spinner size="md" />
          </div>
        ) : results.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-500 mb-1">No patients found for &ldquo;{query}&rdquo;</p>
            <p className="text-xs text-gray-400">Try a different search or register a new patient below</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-1 mb-2">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            {results.map((p) => (
              <button
                key={p.id}
                onClick={() => pickPatient(p)}
                disabled={startingForId !== null}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary-300 hover:bg-primary-50/30 transition-colors text-left disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
                  {p.firstName[0]}
                  {p.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {p.firstName} {p.lastName}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                    {p.medicalRecordNo && <span className="font-mono">{p.medicalRecordNo}</span>}
                    {p.phone && <span>{p.phone}</span>}
                    {p.user?.email && !p.user.email.startsWith('guest-') && (
                      <span className="truncate max-w-[180px]">{p.user.email}</span>
                    )}
                  </div>
                </div>
                {startingForId === p.id ? (
                  <Spinner size="sm" />
                ) : (
                  <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Register new patient footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
        <button
          onClick={onNewPatient}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 text-gray-700 hover:text-primary-700 rounded-xl text-sm font-medium transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Register new patient
        </button>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────
// REGISTER VIEW
// ──────────────────────────────────────────────────────────

interface RegisterViewProps {
  onBack: () => void;
  onRegistered: (patient: Patient) => void;
  isDemo: boolean;
  onDemoStart: (firstName: string, lastName: string) => void;
}

const RegisterView = ({ onBack, onRegistered, isDemo, onDemoStart }: RegisterViewProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [medicalRecordNo, setMedicalRecordNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forceCreate, setForceCreate] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isDemo) {
      onDemoStart(firstName, lastName);
      return;
    }

    try {
      // If no email provided, generate a synthetic one so the User row can be created.
      // These are marked as guest-* and excluded from search display so they never
      // collide with real identifiers.
      const emailToUse = email.trim() || `guest-${Date.now()}@meditir.internal`;

      const payload: Record<string, unknown> = {
        firstName,
        lastName,
        email: emailToUse,
        password: crypto.randomUUID(),
        phone: phone.trim() || undefined,
        medicalRecordNo: medicalRecordNo.trim() || undefined,
        forceCreate,
      };

      const res = await api.post('/patients', payload);
      const patient: Patient = res.data.data;
      onRegistered(patient);
    } catch (err: unknown) {
      const e2 = err as { response?: { status?: number; data?: { message?: string; meta?: { duplicatePatient?: { id: string; firstName: string; lastName: string } } } } };
      const status = e2.response?.status;
      const msg = e2.response?.data?.message || 'Failed to register patient';
      const dup = e2.response?.data?.meta?.duplicatePatient;
      if (status === 409 && dup) {
        setError(
          `${msg}\n\nIf this really is a different person (e.g. family members sharing a phone), check the box below and resubmit.`
        );
      } else {
        setError(msg);
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Amaka"
            required
            autoFocus
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Okafor"
            required
          />
        </div>

        <Input
          label="Email (optional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="amaka@example.com"
        />
        <p className="text-xs text-gray-400 -mt-2">Email lets you find this patient again later and send them after-visit summaries.</p>

        <Input
          label="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="08012345678 or +2348012345678"
        />
        <p className="text-xs text-gray-400 -mt-2">Phone is used for WhatsApp summaries. Nigerian mobile formats only.</p>

        <Input
          label="Medical Record No. (optional)"
          value={medicalRecordNo}
          onChange={(e) => setMedicalRecordNo(e.target.value)}
          placeholder="MRN-0042"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
            {error.includes('phone number already exists') && (
              <label className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={forceCreate}
                  onChange={(e) => setForceCreate(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-200"
                />
                This is a different person — create anyway
              </label>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <Button type="button" variant="secondary" onClick={onBack} className="flex-1" disabled={loading}>
            Back to search
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Register &amp; start
          </Button>
        </div>
      </form>
    </div>
  );
};

// ──────────────────────────────────────────────────────────
// DEMO QUICK FORM (legacy)
// ──────────────────────────────────────────────────────────

const DemoQuickForm = ({ onStart }: { onStart: (firstName: string, lastName: string) => void }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onStart(firstName, lastName);
      }}
      className="px-6 py-5 flex flex-col gap-4"
    >
      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        Demo mode: enter any name to start a mock consultation.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required autoFocus />
        <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </div>
      <Button type="submit">Start Recording</Button>
    </form>
  );
};
