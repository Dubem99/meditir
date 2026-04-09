'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { Hospital } from '@/types/entities.types';
import { format } from 'date-fns';

interface HospitalStats {
  activeDoctors: number;
  totalPatients: number;
  totalSessions: number;
}

export default function ManageHospitalPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [stats, setStats] = useState<HospitalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/hospitals/${id}`),
      api.get(`/hospitals/${id}/stats`),
    ])
      .then(([h, s]) => {
        setHospital(h.data.data);
        setStats(s.data.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleActive = async () => {
    if (!hospital) return;
    setToggling(true);
    try {
      if (hospital.isActive) {
        await api.delete(`/hospitals/${id}`);
        setHospital({ ...hospital, isActive: false });
      } else {
        const res = await api.patch(`/hospitals/${id}`, { isActive: true });
        setHospital(res.data.data);
      }
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }
  if (!hospital) {
    return <div className="text-center py-16 text-gray-500">Hospital not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/superadmin')} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Back
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{hospital.name}</h1>
          <p className="text-sm text-gray-500 font-mono">{hospital.slug}</p>
        </div>
        <Badge variant={hospital.isActive ? 'success' : 'danger'}>
          {hospital.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Doctors', value: stats.activeDoctors, color: 'text-primary-600' },
            { label: 'Total Patients', value: stats.totalPatients, color: 'text-blue-600' },
            { label: 'Total Sessions', value: stats.totalSessions, color: 'text-purple-600' },
          ].map((s) => (
            <Card key={s.label} className="text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Details */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Hospital Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Email', value: hospital.email },
            { label: 'Phone', value: hospital.phone || '—' },
            { label: 'Address', value: hospital.address || '—' },
            { label: 'Registered', value: format(new Date(hospital.createdAt), 'MMMM d, yyyy') },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
              <p className="text-gray-800">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger zone */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-1">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          {hospital.isActive
            ? 'Deactivating will prevent all staff from logging in.'
            : 'Reactivating will restore access for all staff.'}
        </p>
        <Button
          variant={hospital.isActive ? 'danger' : 'primary'}
          loading={toggling}
          onClick={toggleActive}
        >
          {hospital.isActive ? 'Deactivate Hospital' : 'Reactivate Hospital'}
        </Button>
      </Card>
    </div>
  );
}
