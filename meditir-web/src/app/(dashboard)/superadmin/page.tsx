'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { Hospital } from '@/types/entities.types';

export default function SuperAdminDashboard() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/hospitals').then((r) => setHospitals(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
          <p className="text-gray-500 text-sm">Manage all hospitals on Meditir</p>
        </div>
        <Link href="/superadmin/hospitals/new">
          <Button>+ Add Hospital</Button>
        </Link>
      </div>

      <Card padding="none">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Hospitals</h2>
          <span className="text-sm text-gray-500">{hospitals.length} total</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : hospitals.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">No hospitals registered yet</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Hospital', 'Slug', 'Email', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {hospitals.map((h) => (
                <tr key={h.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{h.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{h.slug}</td>
                  <td className="px-6 py-4 text-gray-600">{h.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={h.isActive ? 'success' : 'danger'}>
                      {h.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/superadmin/hospitals/${h.id}`}>
                      <Button size="sm" variant="secondary">Manage</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </Card>
    </div>
  );
}
