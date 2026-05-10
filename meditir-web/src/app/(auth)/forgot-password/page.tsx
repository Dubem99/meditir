'use client';

// Forgot-password — entry point.
// On submit, server returns the same generic message regardless of whether the
// email exists in the DB (anti-enumeration). UI shows that confirmation in
// place of the form so the user knows to go check their inbox.

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: { message?: string } }; request?: unknown };
      if (e2.request && !e2.response) {
        setError('Cannot reach server. Check your connection.');
      } else {
        setError(e2.response?.data?.message || 'Could not send reset email. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Reset your password</h1>
        <p className="text-[#5a7a78] text-sm mt-1.5">
          {submitted
            ? "Check your inbox for a reset link."
            : "Enter your email and we'll send you a link to set a new password."}
        </p>
      </div>

      {submitted ? (
        <div className="space-y-5">
          <div className="bg-[#0c2522] border border-[#2e9690]/30 rounded-xl px-4 py-4 text-sm text-[#7dccc4] leading-relaxed">
            If an account exists for <span className="text-white font-medium">{email}</span>, a reset
            link is on its way. The link expires in 60 minutes and can be used once.
          </div>
          <p className="text-xs text-[#3d5e5c]">
            Didn&apos;t get an email? Check your spam folder, or
            {' '}
            <button
              type="button"
              onClick={() => { setSubmitted(false); }}
              className="text-[#4db0a8] hover:text-[#7dccc4] font-medium"
            >
              try a different email
            </button>.
          </p>
          <div className="pt-4 border-t border-white/[0.06]">
            <Link href="/login" className="text-sm text-[#4db0a8] hover:text-[#7dccc4] font-medium">
              ← Back to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#6b9a98] tracking-wide uppercase">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@hospital.com"
              required
              autoComplete="email"
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-[#3d5e5c] text-sm transition-all outline-none focus:border-[#2e9690]/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#2e9690]/20"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <svg className="h-4 w-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="relative mt-1 w-full py-3 rounded-xl bg-[#237874] hover:bg-[#2e9690] text-white text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            {loading ? 'Sending…' : 'Send reset link'}
          </button>

          <div className="mt-2 pt-6 border-t border-white/[0.06]">
            <Link href="/login" className="text-sm text-[#4db0a8] hover:text-[#7dccc4] font-medium">
              ← Back to sign in
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
