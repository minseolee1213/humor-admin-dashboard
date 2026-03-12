import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';
import { createServerComponentClient } from '@/lib/supabase/server-component-client';
import AdminLayout from '../admin-layout';
import AdminBackButton from '../admin-back-button';

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return '—';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export default async function AdminHumorFlavorStepsPage() {
  await requireSuperadmin();

  const supabase = createServerClient();

  const [
    stepsResult,
    flavorsResult,
    stepTypesResult,
    inputTypesResult,
    outputTypesResult,
    modelsResult,
    providersResult,
  ] = await Promise.all([
    supabase.from('humor_flavor_steps').select('*').order('humor_flavor_id', { ascending: true }).order('order_by', { ascending: true }),
    supabase.from('humor_flavors').select('*'),
    supabase.from('humor_flavor_step_types').select('*'),
    supabase.from('llm_input_types').select('*'),
    supabase.from('llm_output_types').select('*'),
    supabase.from('llm_models').select('*'),
    supabase.from('llm_providers').select('*'),
  ]);

  const error =
    stepsResult.error ||
    flavorsResult.error ||
    stepTypesResult.error ||
    inputTypesResult.error ||
    outputTypesResult.error ||
    modelsResult.error ||
    providersResult.error;

  const flavorsById = new Map<string, any>();
  (flavorsResult.data ?? []).forEach((f: any) => flavorsById.set(String(f.id), f));

  const stepTypeById = new Map<string, any>();
  (stepTypesResult.data ?? []).forEach((t: any) => stepTypeById.set(String(t.id), t));

  const inputTypeById = new Map<string, any>();
  (inputTypesResult.data ?? []).forEach((t: any) => inputTypeById.set(String(t.id), t));

  const outputTypeById = new Map<string, any>();
  (outputTypesResult.data ?? []).forEach((t: any) => outputTypeById.set(String(t.id), t));

  const providerById = new Map<string, any>();
  (providersResult.data ?? []).forEach((p: any) => providerById.set(String(p.id), p));

  const modelById = new Map<string, any>();
  (modelsResult.data ?? []).forEach((m: any) => modelById.set(String(m.id), m));

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Humor Flavor Steps</h1>
        <p className="text-base text-gray-600">Read-only list of humor flavor steps and prompts.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm">
        {error ? (
          <div className="px-6 py-4">
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Error loading humor flavor steps: {error.message}
            </div>
          </div>
        ) : stepsResult.data && stepsResult.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flavor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Step Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Input</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Output</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System Prompt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Prompt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stepsResult.data.map((step: any) => {
                  const flavor = flavorsById.get(String(step.humor_flavor_id));
                  const stepType = stepTypeById.get(String(step.humor_flavor_step_type_id));
                  const inputType = inputTypeById.get(String(step.llm_input_type_id));
                  const outputType = outputTypeById.get(String(step.llm_output_type_id));
                  const model = modelById.get(String(step.llm_model_id));
                  const provider = model ? providerById.get(String(model.llm_provider_id)) : null;

                  const modelLabel = model
                    ? `${provider ? `${provider.name} / ` : ''}${model.name}`
                    : `#${String(step.llm_model_id)}`;

                  return (
                    <tr key={step.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-semibold">{flavor?.slug ?? `#${String(step.humor_flavor_id)}`}</div>
                        {flavor?.description ? (
                          <div className="text-xs text-gray-500 mt-0.5">{truncateText(flavor.description, 60)}</div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{step.order_by}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {stepType?.slug ?? `#${String(step.humor_flavor_step_type_id)}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{modelLabel}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {step.llm_temperature ?? <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {inputType?.slug ?? `#${String(step.llm_input_type_id)}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {outputType?.slug ?? `#${String(step.llm_output_type_id)}`}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-sm">
                        <span title={step.llm_system_prompt ?? ''}>{truncateText(step.llm_system_prompt, 120)}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-sm">
                        <span title={step.llm_user_prompt ?? ''}>{truncateText(step.llm_user_prompt, 120)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(step.created_datetime_utc)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8">
            <p className="text-sm text-gray-500 text-center">No humor flavor steps found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

