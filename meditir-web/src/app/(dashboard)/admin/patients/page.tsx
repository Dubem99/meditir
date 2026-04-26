'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { BulkUploadModal } from '@/components/admin/BulkUploadModal';
import { format } from 'date-fns';
import type { Patient } from '@/types/entities.types';
import Link from 'next/link';

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [bulkOpen, setBulkOpen] = useState(false);

  const load = useCallback((q = '') => {
    setLoading(true);
    api.get(`/patients?limit=50${q ? `&search=${encodeURIComponent(q)}` : ''}`)
      .then((r) => {
        setPatients(r.data.data || []);
        setTotal(r.data.meta?.total || 0);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(search);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} registered</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBulkOpen(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            Bulk upload CSV
          </button>
          <Link
            href="/admin/onboarding"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            + Register Patient
          </Link>
        </div>
      </div>

      <BulkUploadModal
        entity="patients"
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onComplete={() => load(search)}
      />

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or record no..."
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Search
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : patients.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">
              {search ? `No patients found for "${search}"` : 'No patients registered yet.'}
            </p>
            {!search && (
              <Link href="/admin/onboarding" className="mt-3 inline-block text-sm text-primary-600 font-medium hover:underline">
                Register your first patient
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Patient', 'Record No.', 'Contact', 'Blood Group', 'Registered', ''].map((h, i) => (
                  <th key={i} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{p.firstName} {p.lastName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{p.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-gray-600">
                    {p.medicalRecordNo || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-5 py-4 text-gray-600">{p.phone || <span className="text-gray-400">—</span>}</td>
                  <td className="px-5 py-4">
                    {p.bloodGroup ? (
                      <span className="font-mono text-sm font-semibold text-gray-800">{p.bloodGroup}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                    {p.genotype && <span className="text-xs text-gray-500 ml-2">{p.genotype}</span>}
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {format(new Date(), 'MMM d, yyyy')}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/patients/${p.id}/edit`}
                      className="text-xs font-medium text-primary-600 hover:text-primary-700"
                    >
                      Edit
                    </Link>
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
