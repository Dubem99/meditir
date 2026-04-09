'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Role } from '@/types/entities.types';

const roleRedirect: Record<Role, string> = {
  SUPER_ADMIN: '/superadmin',
  HOSPITAL_ADMIN: '/admin',
  DOCTOR: '/doctor',
  PATIENT: '/patient',
};

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemo = () => {
    const demoUser = { id: 'demo', email: 'demo@meditir.com', role: 'DOCTOR' as const, hospitalId: 'demo', hospital: { name: 'Demo Hospital', slug: 'demo', isActive: true } };
    // Write directly to localStorage so it's guaranteed to be there on next page load
    localStorage.setItem('meditir-auth', JSON.stringify({
      state: { user: demoUser, accessToken: 'demo-token', hospitalSlug: 'demo' },
      version: 0,
    }));
    window.location.href = '/doctor';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, user } = res.data.data;
      setAuth(user, accessToken, user.hospital?.slug);
      router.push(roleRedirect[user.role as Role] || '/');
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: { message?: string } }; request?: unknown };
      if (e2.request && !e2.response) {
        setError('Cannot reach server. Check your connection.');
      } else {
        setError(e2.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center mx-auto mb-4">
          <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to your Meditir account</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="doctor@hospital.com"
          required
          autoComplete="email"
          autoFocus
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
          Sign In
        </Button>
      </form>

      <div className="mt-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400 uppercase tracking-wide">
            <span className="bg-white px-3">or</span>
          </div>
        </div>
        <button
          onClick={handleDemo}
          className="mt-4 w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors font-medium"
        >
          Continue with Demo Account
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        New hospital?{' '}
        <Link href="/register" className="text-primary-600 hover:underline font-medium">
          Create account
        </Link>
      </p>
    </div>
  );
}
