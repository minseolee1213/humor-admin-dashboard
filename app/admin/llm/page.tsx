import Link from 'next/link';

import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerComponentClient } from '@/lib/supabase/server-component-client';

import AdminLayout from '../admin-layout';
import AdminBackButton from '../admin-back-button';

const items: Array<{ href: string; label: string; description: string }> = [
  { href: '/admin/llm-providers', label: 'LLM Providers', description: 'Create, update, delete providers' },
  { href: '/admin/llm-models', label: 'LLM Models', description: 'Create, update, delete models and mappings' },
  { href: '/admin/llm-responses', label: 'LLM Responses', description: 'Inspect raw LLM model responses' },
  { href: '/admin/llm-prompt-chains', label: 'LLM Prompt Chains', description: 'Read-only prompt chain records' },
  { href: '/admin/humor-mix', label: 'Humor Mix', description: 'Adjust caption mix per humor flavor' },
];

export default async function AdminLlmLandingPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LLM</h1>
        <p className="text-base text-gray-600">Providers, models, and response inspection tools.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-7">
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group block rounded-2xl border border-gray-200/60 px-5 py-4 hover:bg-gray-50/80 hover:border-gray-300/70 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                </div>
                <span className="text-base text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-transform">
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

