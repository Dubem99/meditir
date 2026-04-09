'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { OfflineBanner } from '@/components/shared/OfflineBanner';
import { useAuthStore } from '@/store/auth.store';
import { setAccessToken } from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Small delay to let Zustand rehydrate from localStorage
    const t = setTimeout(() => setReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/login');
    } else if (accessToken) {
      setAccessToken(accessToken);
    }
  }, [ready, user, accessToken, router]);

  if (!ready || !user) return null;

  return (
    <div className="flex min-h-screen">
      <OfflineBanner />
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
