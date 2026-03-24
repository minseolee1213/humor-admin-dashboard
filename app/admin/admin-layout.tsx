'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './logout-button';

interface AdminLayoutProps {
  children: React.ReactNode;
  userEmail?: string | null;
}

export default function AdminLayout({ children, userEmail }: AdminLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/content', label: 'Content' },
    { href: '/admin/llm', label: 'LLM' },
    { href: '/admin/catalog', label: 'Catalog' },
    { href: '/admin/access', label: 'Access' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    if (href === '/admin/content') {
      return (
        pathname.startsWith('/admin/content') ||
        pathname.startsWith('/admin/images') ||
        pathname.startsWith('/admin/captions') ||
        pathname.startsWith('/admin/caption-requests') ||
        pathname.startsWith('/admin/humor-flavors') ||
        pathname.startsWith('/admin/humor-flavor-steps')
      );
    }
    if (href === '/admin/llm') {
      return (
        pathname.startsWith('/admin/llm') ||
        pathname.startsWith('/admin/llm-providers') ||
        pathname.startsWith('/admin/llm-models') ||
        pathname.startsWith('/admin/llm-responses') ||
        pathname.startsWith('/admin/llm-prompt-chains') ||
        pathname.startsWith('/admin/humor-mix')
      );
    }
    if (href === '/admin/catalog') {
      return pathname.startsWith('/admin/catalog') || pathname.startsWith('/admin/terms') || pathname.startsWith('/admin/caption-examples');
    }
    if (href === '/admin/access') {
      return (
        pathname.startsWith('/admin/access') ||
        pathname.startsWith('/admin/allowed-signup-domains') ||
        pathname.startsWith('/admin/whitelisted-emails')
      );
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <div className="flex min-h-20 flex-wrap items-center justify-between gap-3 py-3">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-3 transition-opacity hover:opacity-90">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm">
                  HA
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold tracking-[0.12em] text-slate-500 dark:text-slate-400">HUMOR PROJECT</span>
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100">Admin Panel</span>
                </div>
              </Link>
            </div>

            {/* Navigation Links - Pill Style with Green Active */}
            <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto pb-1 sm:order-2 sm:w-auto sm:justify-center sm:pb-0">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
                      active
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* User Info and Logout */}
            <div className="order-2 flex items-center gap-3 sm:order-3">
              {userEmail && (
                <div className="hidden sm:flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{userEmail.split('@')[0]}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{userEmail}</span>
                  </div>
                </div>
              )}
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main content - Centered with more padding */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {children}
      </main>
    </div>
  );
}
