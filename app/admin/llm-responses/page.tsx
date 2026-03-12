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
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function truncate(text: string | null | undefined, max = 120): string {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default async function AdminLlmResponsesPage() {
  await requireSuperadmin();

  const supabase = createServerClient();
  const { data: responses, error } = await supabase
    .from('llm_model_responses')
    .select('*')
    .order('created_datetime_utc', { ascending: false })
    .limit(200);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LLM Responses</h1>
        <p className="text-base text-gray-600">
          Read-only log of raw LLM model responses for inspection and debugging.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm">
        {error ? (
          <div className="px-6 py-4">
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Error loading LLM responses: {error.message}
            </div>
          </div>
        ) : responses && responses.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {responses.map((row: any) => (
              <details key={row.id} className="group px-6 py-4">
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        Model #{row.llm_model_id}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        Flavor #{row.humor_flavor_id}
                      </span>
                      {row.llm_temperature != null && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          Temp {String(row.llm_temperature)}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDate(row.created_datetime_utc)} • {row.processing_time_seconds}s
                      </span>
                    </div>
                    <div className="text-sm text-gray-900 line-clamp-2">
                      {truncate(row.llm_model_response, 200) || <span className="text-gray-400">No response text</span>}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>Profile: {String(row.profile_id).slice(0, 8)}…</span>
                      <span>Caption request: {String(row.caption_request_id)}</span>
                      {row.llm_prompt_chain_id && <span>Prompt chain: {String(row.llm_prompt_chain_id)}</span>}
                      {row.humor_flavor_step_id && <span>Step: {String(row.humor_flavor_step_id)}</span>}
                    </div>
                  </div>
                  <span className="mt-1 text-xs text-gray-400 group-open:rotate-90 transition-transform">▶</span>
                </summary>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                  <div className="lg:col-span-1 space-y-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Metadata</h3>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 space-y-1">
                      <div>ID: {row.id}</div>
                      <div>Model ID: {row.llm_model_id}</div>
                      <div>Profile ID: {row.profile_id}</div>
                      <div>Caption Request ID: {row.caption_request_id}</div>
                      <div>Humor Flavor ID: {row.humor_flavor_id}</div>
                      {row.llm_prompt_chain_id && <div>Prompt Chain ID: {row.llm_prompt_chain_id}</div>}
                      {row.humor_flavor_step_id && <div>Humor Flavor Step ID: {row.humor_flavor_step_id}</div>}
                    </div>
                  </div>

                  <div className="lg:col-span-1 space-y-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">System Prompt</h3>
                    <pre className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 whitespace-pre-wrap">
                      {row.llm_system_prompt}
                    </pre>
                  </div>

                  <div className="lg:col-span-1 space-y-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">User Prompt</h3>
                    <pre className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 whitespace-pre-wrap">
                      {row.llm_user_prompt}
                    </pre>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">LLM Response</h3>
                  <pre className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-xs text-gray-800 whitespace-pre-wrap max-h-80 overflow-auto">
                    {row.llm_model_response ?? '—'}
                  </pre>
                </div>
              </details>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8">
            <p className="text-sm text-gray-500 text-center">No LLM responses found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

