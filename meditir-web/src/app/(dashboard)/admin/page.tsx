'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

interface Stats {
  activeDoctors: number;
  totalPatients: number;
  totalSessions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The hospital ID is resolved from the slug in the request header
    api.get('/hospitals/me/stats').then((r) => setStats(r.data.data)).catch(() => {
      // Fallback: aggregate locally
      Promise.all([
        api.get('/doctors?limit=1'),
        api.get('/patients?limit=1'),
        api.get('/sessions?limit=1'),
      ]).then(([d, p, s]) => {
        setStats({
          activeDoctors: d.data.meta?.total || 0,
          totalPatients: p.data.meta?.total || 0,
          totalSessions: s.data.meta?.total || 0,
        });
      }).finally(() => setLoading(false));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Dashboard</h1>
          <p className="text-gray-500 text-sm">Overview of your hospital platform</p>
        </div>
        <Link href="/admin/onboarding">
          <Button>+ Onboard Staff</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Doctors', value: stats?.activeDoctors ?? 0, href: '/admin/doctors', color: 'text-primary-600' },
            { label: 'Total Patients', value: stats?.totalPatients ?? 0, href: '/admin/patients', color: 'text-blue-600' },
            { label: 'Total Sessions', value: stats?.totalSessions ?? 0, href: '/admin/sessions', color: 'text-purple-600' },
          ].map((s) => (
            <Link key={s.label} href={s.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer text-center">
                <p className={`text-4xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-sm text-gray-500 mt-2">{s.label}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Link href="/admin/doctors">
          <Card className="hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Manage Doctors</p>
              <p className="text-sm text-gray-500">View schedules, onboard new doctors</p>
            </div>
          </Card>
        </Link>
        <Link href="/admin/patients">
          <Card className="hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Manage Patients</p>
              <p className="text-sm text-gray-500">Register patients, view records</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
