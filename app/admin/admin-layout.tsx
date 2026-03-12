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
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-700 text-white text-sm font-semibold">
                  HA
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">HUMOR PROJECT</span>
                  <span className="text-base font-bold text-gray-900">Admin</span>
                </div>
              </Link>
            </div>

            {/* Navigation Links - Pill Style with Green Active */}
            <nav className="flex items-center gap-1.5">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide rounded-lg transition-all duration-200 ${
                      active
                        ? 'text-white bg-green-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* User Info and Logout */}
            <div className="flex items-center gap-3">
              {userEmail && (
                <div className="hidden sm:flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{userEmail.split('@')[0]}</span>
                    <span className="text-xs text-gray-500">{userEmail}</span>
                  </div>
                </div>
              )}
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main content - Centered with more padding */}
      <main className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-10 py-10">
        {children}
      </main>
    </div>
  );
}
