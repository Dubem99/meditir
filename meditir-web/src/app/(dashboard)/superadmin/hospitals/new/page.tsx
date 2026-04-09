'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import Link from 'next/link';

export default function NewHospitalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    hospitalName: '',
    hospitalSlug: '',
    hospitalEmail: '',
    adminEmail: '',
    adminPassword: '',
    adminFirstName: '',
    adminLastName: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => {
      const update: Record<string, string> = { [field]: value };
      if (field === 'hospitalName') {
        update.hospitalSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
      return { ...prev, ...update };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      router.push('/superadmin');
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: { message?: string } } };
      setError(e2.response?.data?.message || 'Failed to create hospital');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/superadmin" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Register New Hospital</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Hospital Information</p>
            <div className="flex flex-col gap-3">
              <Input label="Hospital Name" value={form.hospitalName} onChange={handleChange('hospitalName')} required />
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    label="Hospital Slug"
                    value={form.hospitalSlug}
                    onChange={handleChange('hospitalSlug')}
                    placeholder="lagos-general-hospital"
                    required
                    pattern="^[a-z0-9-]+$"
                  />
                  <p className="text-xs text-gray-400 mt-1">Used in URLs. Lowercase letters, numbers, and hyphens only.</p>
                </div>
                <div className="flex-1">
                  <Input label="Hospital Email" type="email" value={form.hospitalEmail} onChange={handleChange('hospitalEmail')} required />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Admin Account</p>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="First Name" value={form.adminFirstName} onChange={handleChange('adminFirstName')} required />
                <Input label="Last Name" value={form.adminLastName} onChange={handleChange('adminLastName')} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Admin Email" type="email" value={form.adminEmail} onChange={handleChange('adminEmail')} required />
                <Input label="Temporary Password" type="password" value={form.adminPassword} onChange={handleChange('adminPassword')} required minLength={8} />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => router.push('/superadmin')} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Create Hospital
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
