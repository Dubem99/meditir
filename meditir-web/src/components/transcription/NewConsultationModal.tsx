'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Props {
  onClose: () => void;
}

export const NewConsultationModal = ({ onClose }: Props) => {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Demo mode — use a mock session
    const stored = localStorage.getItem('meditir-auth');
    const isDemo = stored ? JSON.parse(stored)?.state?.user?.id === 'demo' : false;
    if (isDemo) {
      const demoSessionId = `demo-session-${Date.now()}`;
      localStorage.setItem(`demo-session-${demoSessionId}`, JSON.stringify({
        id: demoSessionId,
        patient: { id: 'p1', firstName, lastName, medicalRecordNo: '' },
        status: 'IN_PROGRESS',
        dialect: 'NIGERIAN_ENGLISH',
        roomToken: 'demo-room',
        scheduledAt: new Date().toISOString(),
        doctor: { id: 'd1', firstName: 'Demo', lastName: 'Doctor', specialization: 'General Practice' },
        soapNote: null,
      }));
      window.location.href = `/doctor/sessions/${demoSessionId}`;
      return;
    }

    try {
      const email = `guest-${Date.now()}@meditir.internal`;
      const patientRes = await api.post('/patients', {
        firstName,
        lastName,
        email,
        password: crypto.randomUUID(),
      });
      const patientId = patientRes.data.data.id;

      const sessionRes = await api.post('/sessions', {
        patientId,
        dialect: 'NIGERIAN_ENGLISH',
        scheduledAt: new Date().toISOString(),
      });
      const sessionId = sessionRes.data.data.id;
      router.push(`/doctor/sessions/${sessionId}`);
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: { message?: string } } };
      setError(e2.response?.data?.message || 'Failed to start consultation');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">New Consultation</h2>
            <p className="text-sm text-gray-500 mt-0.5">Enter patient details to begin recording</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleStart} className="flex flex-col gap-4">
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

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 mt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Start Recording
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
