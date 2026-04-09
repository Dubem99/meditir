'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
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
      // Auto-generate slug from hospital name
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
      setSuccess(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } }; request?: unknown; message?: string };
      if (e.response?.data?.errors) {
        const errs = Object.entries(e.response.data.errors).map(([k, v]) => `${k}: ${v.join(', ')}`).join(' · ');
        setError(errs);
      } else if (e.response?.data?.message) {
        setError(e.response.data.message);
      } else if (e.request) {
        setError('Cannot reach the server. Check that the API URL is configured correctly in Vercel environment variables (NEXT_PUBLIC_API_URL).');
      } else {
        setError(e.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Hospital Registered!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your hospital <strong>{form.hospitalName}</strong> is ready.
            Sign in with your admin credentials.
          </p>
          <Button onClick={() => router.push('/login')} className="w-full">Go to Sign In</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Register your Hospital</h1>
        <p className="text-sm text-gray-500 mt-1">Create your Meditir account</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="border-b border-gray-100 pb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Hospital Info</p>
          <div className="flex flex-col gap-3">
            <Input label="Hospital Name" value={form.hospitalName} onChange={handleChange('hospitalName')} required />
            <Input label="Hospital Slug (URL identifier)" value={form.hospitalSlug} onChange={handleChange('hospitalSlug')}
              placeholder="lagos-general-hospital" required pattern="^[a-z0-9-]+$" />
            <Input label="Hospital Email" type="email" value={form.hospitalEmail} onChange={handleChange('hospitalEmail')} required />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Admin Account</p>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" value={form.adminFirstName} onChange={handleChange('adminFirstName')} required />
              <Input label="Last Name" value={form.adminLastName} onChange={handleChange('adminLastName')} required />
            </div>
            <Input label="Admin Email" type="email" value={form.adminEmail} onChange={handleChange('adminEmail')} required />
            <Input label="Password" type="password" value={form.adminPassword} onChange={handleChange('adminPassword')}
              placeholder="Min 8 characters" required minLength={8} />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
          Create Hospital Account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-600 hover:underline font-medium">Sign in</Link>
      </p>
    </Card>
  );
}
