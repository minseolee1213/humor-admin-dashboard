import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';
import { createServerComponentClient } from '@/lib/supabase/server-component-client';
import AdminLayout from '../admin-layout';
import AdminBackButton from '../admin-back-button';
import LlmProviderForm, { type LlmProvider } from './llm-provider-form';
import LlmProvidersTable from './llm-providers-table';

export default async function AdminLlmProvidersPage() {
  await requireSuperadmin();

  const supabase = createServerClient();
  const { data, error } = await supabase.from('llm_providers').select('*').order('id', { ascending: true });

  const providers: LlmProvider[] =
    (data ?? []).map((row: any) => ({
      id: row.id,
      created_datetime_utc: row.created_datetime_utc,
      name: row.name,
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LLM Providers</h1>
        <p className="text-base text-gray-600">Create, update, and delete LLM providers.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Provider</h2>
        <LlmProviderForm />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm">
        {error ? (
          <div className="px-6 py-4">
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Error loading providers: {error.message}
            </div>
          </div>
        ) : (
          <LlmProvidersTable providers={providers} />
        )}
      </div>
    </AdminLayout>
  );
}

