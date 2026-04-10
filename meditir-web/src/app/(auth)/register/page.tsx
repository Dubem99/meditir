'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const inputClass = "w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-[#3d5e5c] text-sm transition-all outline-none focus:border-[#2e9690]/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#2e9690]/20";
const labelClass = "block text-xs font-medium text-[#6b9a98] tracking-wide uppercase mb-1.5";

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
        setError('Cannot reach the server. Check your connection.');
      } else {
        setError(e.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full text-center">
        <div className="w-14 h-14 rounded-2xl border border-[#2e9690]/30 bg-[#2e9690]/10 flex items-center justify-center mx-auto mb-5">
          <svg className="h-7 w-7 text-[#4db0a8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Hospital Registered</h2>
        <p className="text-[#5a7a78] text-sm mb-8">
          <strong className="text-white">{form.hospitalName}</strong> is ready.<br />
          Sign in with your admin credentials to get started.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="w-full py-3 rounded-xl bg-[#237874] hover:bg-[#2e9690] text-white text-sm font-semibold tracking-wide transition-all"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white tracking-tight">Register your hospital</h1>
        <p className="text-[#5a7a78] text-sm mt-1.5">Set up your Meditir workspace in minutes</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Hospital info */}
        <div>
          <p className="text-[#2e9690] text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-3 h-px bg-[#2e9690]/50 inline-block" />
            Hospital Info
          </p>
          <div className="flex flex-col gap-3">
            <div>
              <label className={labelClass}>Hospital Name</label>
              <input className={inputClass} value={form.hospitalName} onChange={handleChange('hospitalName')} placeholder="Lagos General Hospital" required />
            </div>
            <div>
              <label className={labelClass}>URL Identifier (slug)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3d5e5c] text-sm pointer-events-none">meditir.app/</span>
                <input
                  className={`${inputClass} pl-[104px]`}
                  value={form.hospitalSlug}
                  onChange={handleChange('hospitalSlug')}
                  placeholder="lagos-general"
                  required
                  pattern="^[a-z0-9-]+$"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Hospital Email</label>
              <input className={inputClass} type="email" value={form.hospitalEmail} onChange={handleChange('hospitalEmail')} placeholder="info@hospital.com" required />
            </div>
          </div>
        </div>

        {/* Admin account */}
        <div>
          <p className="text-[#2e9690] text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-3 h-px bg-[#2e9690]/50 inline-block" />
            Admin Account
          </p>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>First Name</label>
                <input className={inputClass} value={form.adminFirstName} onChange={handleChange('adminFirstName')} placeholder="Chukwudi" required />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input className={inputClass} value={form.adminLastName} onChange={handleChange('adminLastName')} placeholder="Obi" required />
              </div>
            </div>
            <div>
              <label className={labelClass}>Admin Email</label>
              <input className={inputClass} type="email" value={form.adminEmail} onChange={handleChange('adminEmail')} placeholder="admin@hospital.com" required />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input className={inputClass} type="password" value={form.adminPassword} onChange={handleChange('adminPassword')} placeholder="Min. 8 characters" required minLength={8} />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <svg className="h-4 w-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="relative w-full py-3 rounded-xl bg-[#237874] hover:bg-[#2e9690] text-white text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating workspace…
            </span>
          ) : (
            'Create Hospital Account'
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-white/[0.06]">
        <p className="text-sm text-[#3d5e5c] text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-[#4db0a8] hover:text-[#7dccc4] font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
