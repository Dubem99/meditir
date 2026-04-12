'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import type { Patient } from '@/types/entities.types';

const calculateAge = (dob?: string | null): number | null => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  return Math.floor((Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
};

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const load = useCallback((q = '') => {
    setLoading(true);
    api
      .get(`/patients?limit=50${q ? `&search=${encodeURIComponent(q)}` : ''}`)
      .then((r) => {
        setPatients(r.data.data || []);
        setTotal(r.data.meta?.total || 0);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(search);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Patients</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {total} registered · click any patient to see their full history
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone, or record no…"
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
        />
        <button
          type="submit"
          className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 text-center py-16">
          <p className="text-sm text-gray-500">
            {search ? `No patients found for "${search}"` : 'No patients registered yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {patients.map((p) => {
            const age = calculateAge(p.dateOfBirth);
            const hasAllergies = (p.allergies ?? []).length > 0;
            const hasChronic = (p.chronicConditions ?? []).length > 0;
            return (
              <Link
                key={p.id}
                href={`/doctor/patients/${p.id}`}
                className="group flex items-start gap-3 bg-white rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-all p-4"
              >
                <div className="w-11 h-11 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm shrink-0">
                  {p.firstName[0]}
                  {p.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors truncate">
                    {p.firstName} {p.lastName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {age !== null && <span className="text-xs text-gray-500">{age} yrs</span>}
                    {p.gender && (
                      <span className="text-xs text-gray-500">· {p.gender.toLowerCase().replace(/_/g, ' ')}</span>
                    )}
                    {p.medicalRecordNo && (
                      <span className="text-[10px] font-mono text-gray-400">{p.medicalRecordNo}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {p.bloodGroup && (
                      <span className="text-[10px] font-mono text-red-700 bg-red-50 border border-red-100 rounded px-1.5 py-0.5">
                        {p.bloodGroup}
                      </span>
                    )}
                    {p.genotype && (
                      <span className="text-[10px] font-mono text-purple-700 bg-purple-50 border border-purple-100 rounded px-1.5 py-0.5">
                        {p.genotype}
                      </span>
                    )}
                    {hasAllergies && (
                      <span className="text-[10px] text-red-700 bg-red-50 border border-red-100 rounded-full px-1.5 py-0.5">
                        ⚠ {p.allergies?.length} {p.allergies?.length === 1 ? 'allergy' : 'allergies'}
                      </span>
                    )}
                    {hasChronic && (
                      <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-100 rounded-full px-1.5 py-0.5">
                        {p.chronicConditions?.length} chronic
                      </span>
                    )}
                  </div>
                </div>
                <svg
                  className="h-4 w-4 text-gray-300 group-hover:text-primary-600 transition-colors shrink-0 mt-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
