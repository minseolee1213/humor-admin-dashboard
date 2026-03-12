import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';
import { createServerComponentClient } from '@/lib/supabase/server-component-client';
import AdminLayout from '../admin-layout';
import AdminBackButton from '../admin-back-button';

import LlmModelForm, { type LlmModel, type LlmProviderOption } from './llm-model-form';
import LlmModelsTable from './llm-models-table';

export default async function AdminLlmModelsPage() {
  await requireSuperadmin();

  const supabase = createServerClient();

  const [modelsResult, providersResult] = await Promise.all([
    supabase.from('llm_models').select('*').order('id', { ascending: true }),
    supabase.from('llm_providers').select('*').order('id', { ascending: true }),
  ]);

  const error = modelsResult.error || providersResult.error;

  const providers: LlmProviderOption[] =
    (providersResult.data ?? []).map((row: any) => ({
      id: row.id,
      name: row.name,
    })) ?? [];

  const models: LlmModel[] =
    (modelsResult.data ?? []).map((row: any) => ({
      id: row.id,
      created_datetime_utc: row.created_datetime_utc,
      name: row.name,
      llm_provider_id: row.llm_provider_id,
      provider_model_id: row.provider_model_id,
      is_temperature_supported: row.is_temperature_supported,
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LLM Models</h1>
        <p className="text-base text-gray-600">Create, update, and delete LLM models. Providers are required.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Model</h2>
        {providers.length === 0 ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            You have no providers yet. Create a provider first in <span className="font-semibold">LLM Providers</span>.
          </div>
        ) : (
          <LlmModelForm providers={providers} />
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm">
        {error ? (
          <div className="px-6 py-4">
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Error loading models: {error.message}
            </div>
          </div>
        ) : (
          <LlmModelsTable models={models} providers={providers} />
        )}
      </div>
    </AdminLayout>
  );
}

