'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import type { Doctor } from '@/types/entities.types';
import Link from 'next/link';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.get('/doctors?limit=100')
      .then((r) => setDoctors(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleDoctor = async (doctorId: string, currentlyAvailable: boolean) => {
    setToggling(doctorId);
    try {
      await api.patch(`/doctors/${doctorId}`, { isAvailable: !currentlyAvailable });
      setDoctors((prev) =>
        prev.map((d) => d.id === doctorId ? { ...d, isAvailable: !currentlyAvailable } : d)
      );
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-sm text-gray-500 mt-0.5">{doctors.length} registered</p>
        </div>
        <Link
          href="/admin/onboarding"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          + Onboard Doctor
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No doctors yet.</p>
            <Link href="/admin/onboarding" className="mt-3 inline-block text-sm text-primary-600 font-medium hover:underline">
              Onboard your first doctor
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Doctor', 'Specialization', 'License', 'Last Active', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {doctors.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-700 font-semibold text-xs shrink-0">
                        {d.firstName[0]}{d.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Dr. {d.firstName} {d.lastName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{d.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-700">{d.specialization}</td>
                  <td className="px-5 py-4 font-mono text-xs text-gray-500">{d.licenseNumber}</td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {d.user?.lastLoginAt
                      ? format(new Date(d.user.lastLoginAt), 'MMM d, yyyy')
                      : 'Never'}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={d.isAvailable ? 'success' : 'danger'}>
                      {d.isAvailable ? 'Active' : 'Deactivated'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleDoctor(d.id, d.isAvailable)}
                      disabled={toggling === d.id}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                        d.isAvailable
                          ? 'text-red-600 border-red-200 hover:bg-red-50'
                          : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {toggling === d.id ? '...' : d.isAvailable ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
