import Link from 'next/link';

import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerComponentClient } from '@/lib/supabase/server-component-client';

import AdminLayout from '../admin-layout';
import AdminBackButton from '../admin-back-button';

const items: Array<{ href: string; label: string; description: string }> = [
  { href: '/admin/allowed-signup-domains', label: 'Allowed Signup Domains', description: 'Manage approved email domains' },
  { href: '/admin/whitelisted-emails', label: 'Whitelisted Emails', description: 'Manage whitelisted email addresses' },
];

export default async function AdminAccessLandingPage() {
  await requireSuperadmin();

  const supabaseSession = await createServerComponentClient();
  const {
    data: { session },
  } = await supabaseSession.auth.getSession();

  return (
    <AdminLayout userEmail={session?.user.email}>
      <div className="mb-8">
        <div className="mb-4">
          <AdminBackButton />
        </div>
        <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-100">Access</h1>
        <p className="text-base text-slate-600 dark:text-slate-300">Signup and access control lists.</p>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Sections</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">{items.length} items</span>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group block rounded-xl border border-slate-200/80 bg-slate-50/40 px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm dark:border-slate-700/80 dark:bg-slate-800/30 dark:hover:border-slate-600 dark:hover:bg-slate-800"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.label}</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.description}</div>
                </div>
                <span className="text-base text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

