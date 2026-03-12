import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';
import { createServerComponentClient } from '@/lib/supabase/server-component-client';
import AdminLayout from '../admin-layout';
import AdminBackButton from '../admin-back-button';

import TermForm, { type TermRow, type TermTypeOption } from './term-form';
import TermsTable from './terms-table';

export default async function AdminTermsPage() {
  await requireSuperadmin();

  const supabase = createServerClient();
  const [termsResult, termTypesResult] = await Promise.all([
    supabase.from('terms').select('*').order('created_datetime_utc', { ascending: false }),
    supabase.from('term_types').select('*').order('name', { ascending: true }),
  ]);

  const error = termsResult.error || termTypesResult.error;

  const termTypes: TermTypeOption[] =
    (termTypesResult.data ?? []).map((t: any) => ({
      id: t.id,
      name: t.name,
    })) ?? [];

  const terms: TermRow[] =
    (termsResult.data ?? []).map((t: any) => ({
      id: t.id,
      created_datetime_utc: t.created_datetime_utc,
      modified_datetime_utc: t.modified_datetime_utc,
      term: t.term,
      definition: t.definition,
      example: t.example,
      priority: t.priority,
      term_type_id: t.term_type_id,
    })) ?? [];

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms</h1>
        <p className="text-base text-gray-600">Create, update, and delete glossary terms.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Term</h2>
        <TermForm termTypes={termTypes} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm">
        {error ? (
          <div className="px-6 py-4">
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Error loading terms: {error.message}
            </div>
          </div>
        ) : (
          <TermsTable terms={terms} termTypes={termTypes} />
        )}
      </div>
    </AdminLayout>
  );
}

