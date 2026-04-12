'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/api';
import { Logo } from '@/components/ui/Logo';
import type { Role } from '@/types/entities.types';

interface NavItem {
  href: string;
  label: string;
  roles: Role[];
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/doctor',
    label: 'Home',
    roles: ['DOCTOR'],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/doctor/patients',
    label: 'Patients',
    roles: ['DOCTOR'],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/doctor/sessions',
    label: 'All Notes',
    roles: ['DOCTOR'],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: '/admin',
    label: 'Dashboard',
    roles: ['HOSPITAL_ADMIN'],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/admin/doctors',
    label: 'Doctors',
    roles: ['HOSPITAL_ADMIN'],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href: '/admin/patients',
    label: 'Patients',
    roles: ['HOSPITAL_ADMIN'],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/admin/sessions',
    label: 'Sessions',
    roles: ['HOSPITAL_ADMIN'],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: '/admin/onboarding',
    label: 'Onboard',
    roles: ['HOSPITAL_ADMIN'],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    href: '/superadmin',
    label: 'Hospitals',
    roles: ['SUPER_ADMIN'],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    href: '/patient',
    label: 'My Records',
    roles: ['PATIENT'],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));
  const initials = user.email.slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAuth();
    router.push('/login');
  };

  const isActive = (href: string) =>
    href === '/doctor' || href === '/admin' || href === '/superadmin' || href === '/patient'
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {visibleItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClick}
          className={clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive(item.href)
              ? 'bg-primary-50 text-primary-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          )}
        >
          <span className={isActive(item.href) ? 'text-primary-600' : 'text-gray-400'}>{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex print:hidden flex-col w-56 bg-white border-r border-gray-100 min-h-screen shrink-0">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <Logo />
        </div>
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          <NavLinks />
        </nav>
        <div className="px-3 py-4 border-t border-gray-100 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs shrink-0">
              {initials}
            </div>
            <p className="text-xs text-gray-600 truncate flex-1">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden print:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 h-14 bg-white border-b border-gray-100">
        <Logo />
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-white h-full shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <Logo />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
              <NavLinks onClick={() => setMobileOpen(false)} />
            </nav>
            <div className="px-3 py-4 border-t border-gray-100 space-y-1">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm shrink-0">
                  {initials}
                </div>
                <p className="text-xs text-gray-600 truncate flex-1">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
