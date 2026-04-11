'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { Patient } from '@/types/entities.types';

interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  medicalRecordNo: string;
  bloodGroup: string;
  genotype: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  nextOfKin: string;
  nextOfKinPhone: string;
  allergies: string;
  chronicConditions: string;
}

const emptyForm: FormState = {
  firstName: '',
  lastName: '',
  phone: '',
  medicalRecordNo: '',
  bloodGroup: '',
  genotype: '',
  gender: '',
  dateOfBirth: '',
  address: '',
  nextOfKin: '',
  nextOfKinPhone: '',
  allergies: '',
  chronicConditions: '',
};

export default function EditPatientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/patients/${id}`)
      .then((res) => {
        if (cancelled) return;
        const p: Patient = res.data.data;
        setPatient(p);
        setForm({
          firstName: p.firstName ?? '',
          lastName: p.lastName ?? '',
          phone: p.phone ?? '',
          medicalRecordNo: p.medicalRecordNo ?? '',
          bloodGroup: p.bloodGroup ?? '',
          genotype: p.genotype ?? '',
          gender: p.gender ?? '',
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '',
          address: p.address ?? '',
          nextOfKin: p.nextOfKin ?? '',
          nextOfKinPhone: p.nextOfKinPhone ?? '',
          allergies: (p.allergies ?? []).join(', '),
          chronicConditions: (p.chronicConditions ?? []).join(', '),
        });
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load patient');
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        medicalRecordNo: form.medicalRecordNo || undefined,
        bloodGroup: form.bloodGroup || undefined,
        genotype: form.genotype || undefined,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        address: form.address || undefined,
        nextOfKin: form.nextOfKin || undefined,
        nextOfKinPhone: form.nextOfKinPhone || undefined,
        allergies: form.allergies
          ? form.allergies.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        chronicConditions: form.chronicConditions
          ? form.chronicConditions.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      };
      await api.patch(`/patients/${id}`, payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to save patient'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 text-gray-500">
        Patient not found.
        <div className="mt-4">
          <Button variant="secondary" onClick={() => router.push('/admin/patients')}>
            Back to patients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <button
          onClick={() => router.push('/admin/patients')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-3 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to patients
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Patient</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {patient.firstName} {patient.lastName} · {patient.user?.email}
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Patient details</h2>
        </CardHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              required
            />
            <Input
              label="Last Name"
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Medical Record No."
              value={form.medicalRecordNo}
              onChange={(e) => update('medicalRecordNo', e.target.value)}
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="08012345678 or +2348012345678"
            />
          </div>
          <p className="text-xs text-gray-500 -mt-2">
            Phone is used for WhatsApp after-visit summaries. Accepts Nigerian mobile formats only.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => update('dateOfBirth', e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => update('gender', e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Not specified</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Blood Group"
              value={form.bloodGroup}
              onChange={(e) => update('bloodGroup', e.target.value)}
              placeholder="e.g. A+"
            />
            <Input
              label="Genotype"
              value={form.genotype}
              onChange={(e) => update('genotype', e.target.value)}
              placeholder="e.g. AA"
            />
          </div>

          <Input
            label="Address"
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Next of Kin"
              value={form.nextOfKin}
              onChange={(e) => update('nextOfKin', e.target.value)}
            />
            <Input
              label="Next of Kin Phone"
              value={form.nextOfKinPhone}
              onChange={(e) => update('nextOfKinPhone', e.target.value)}
              placeholder="08012345678 or +2348012345678"
            />
          </div>

          <Input
            label="Allergies (comma-separated)"
            value={form.allergies}
            onChange={(e) => update('allergies', e.target.value)}
            placeholder="e.g. Penicillin, Peanuts"
          />
          <Input
            label="Chronic Conditions (comma-separated)"
            value={form.chronicConditions}
            onChange={(e) => update('chronicConditions', e.target.value)}
            placeholder="e.g. Hypertension, Diabetes Type 2"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">Saved successfully.</p>}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/admin/patients')}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="flex-1">
              Save changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
