'use client';

// Reset-password — second step. Reads ?token= from the URL and lets the user
// pick a new password. Token validity is verified server-side on submit; we
// intentionally don't pre-check it (would just leak token validity to anyone
// who landed on this page). On success, redirects back to /login.

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Link incomplete</h1>
          <p className="text-[#5a7a78] text-sm mt-1.5">
            This reset link is missing its token. Use the link sent to your email, or request a new one.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/forgot-password"
            className="bg-[#237874] hover:bg-[#2e9690] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Request a new link
          </Link>
          <Link href="/login" className="text-sm text-[#4db0a8] hover:text-[#7dccc4] font-medium">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      // Brief pause so the user sees the confirmation, then redirect.
      setTimeout(() => router.push('/login'), 1800);
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: { message?: string } }; request?: unknown };
      if (e2.request && !e2.response) {
        setError('Cannot reach server. Check your connection.');
      } else {
        setError(e2.response?.data?.message || 'Could not reset password. The link may have expired.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Choose a new password</h1>
        <p className="text-[#5a7a78] text-sm mt-1.5">
          {success
            ? 'Password updated. Redirecting to sign in…'
            : 'Pick something at least 8 characters long. Other devices will be signed out.'}
        </p>
      </div>

      {success ? (
        <div className="bg-[#0c2522] border border-[#2e9690]/30 rounded-xl px-4 py-4 text-sm text-[#7dccc4]">
          Password updated successfully. Taking you to sign in…
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#6b9a98] tracking-wide uppercase">New password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
                autoFocus
                className="w-full px-4 py-3 pr-11 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-[#3d5e5c] text-sm transition-all outline-none focus:border-[#2e9690]/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#2e9690]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3d6462] hover:text-[#6b9a98] transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#6b9a98] tracking-wide uppercase">Confirm password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
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
            {loading ? 'Updating…' : 'Update password'}
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

// useSearchParams forces the route to opt out of static generation; wrap in
// Suspense so the page hydrates cleanly without a build-time warning.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-[#5a7a78] text-sm">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
