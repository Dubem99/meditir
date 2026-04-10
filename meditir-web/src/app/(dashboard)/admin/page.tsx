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

interface AnalyticsPoint {
  date: string;
  total: number;
  completed: number;
}

const SessionsChart = ({ data }: { data: AnalyticsPoint[] }) => {
  if (data.length === 0) return <p className="text-sm text-gray-400 text-center py-8">No session data for the last 30 days.</p>;

  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const last14 = data.slice(-14); // show last 14 days for readability

  return (
    <div className="flex items-end gap-1 h-28 w-full">
      {last14.map((d) => {
        const heightPct = Math.max((d.total / maxVal) * 100, 4);
        const completedPct = d.total > 0 ? (d.completed / d.total) * 100 : 0;
        const dayLabel = new Date(d.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"
            >
              {dayLabel}: {d.total} session{d.total !== 1 ? 's' : ''}, {d.completed} completed
            </div>
            <div className="w-full relative rounded-t-sm overflow-hidden" style={{ height: `${heightPct}%` }}>
              <div className="absolute inset-0 bg-primary-100 rounded-t-sm" />
              <div className="absolute bottom-0 left-0 right-0 bg-primary-500 rounded-t-sm transition-all" style={{ height: `${completedPct}%` }} />
            </div>
            <span className="text-[9px] text-gray-400 truncate w-full text-center leading-none">
              {new Date(d.date + 'T00:00:00').getDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    api.get('/hospitals/me/stats').then((r) => setStats(r.data.data)).catch(() => {
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

    api.get('/sessions/analytics')
      .then((r) => setAnalytics(r.data.data || []))
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false));
  }, []);

  const totalLast30 = analytics.reduce((sum, d) => sum + d.total, 0);
  const completedLast30 = analytics.reduce((sum, d) => sum + d.completed, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Dashboard</h1>
          <p className="text-gray-500 text-sm">Overview of your hospital platform</p>
        </div>
        <Link href="/admin/onboarding" className="shrink-0">
          <Button>+ Onboard Staff</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Sessions Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Sessions — Last 30 Days</h2>
            {!analyticsLoading && totalLast30 > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                {totalLast30} total · {completedLast30} completed ({Math.round((completedLast30 / totalLast30) * 100)}%)
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-primary-500 inline-block" /> Completed</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-primary-100 inline-block" /> Scheduled/Other</span>
          </div>
        </div>
        {analyticsLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <SessionsChart data={analytics} />
        )}
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/doctors">
          <Card className="hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
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
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
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
