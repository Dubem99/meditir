'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { OfflineBanner } from '@/components/shared/OfflineBanner';
import { useAuthStore } from '@/store/auth.store';
import { setAccessToken } from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    if (accessToken) setAccessToken(accessToken);
  }, [user, accessToken, router]);

  if (!user) return null;

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
