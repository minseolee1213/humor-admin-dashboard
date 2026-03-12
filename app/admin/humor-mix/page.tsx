import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';
import { createServerComponentClient } from '@/lib/supabase/server-component-client';
import AdminLayout from '../admin-layout';
import AdminBackButton from '../admin-back-button';
import { updateHumorMix } from './actions';

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export default async function AdminHumorMixPage() {
  await requireSuperadmin();

  const supabase = createServerClient();
  const [mixResult, flavorsResult] = await Promise.all([
    supabase
      .from('humor_flavor_mix')
      .select('*')
      .order('humor_flavor_id', { ascending: true }),
    supabase.from('humor_flavors').select('*'),
  ]);

  const error = mixResult.error || flavorsResult.error;

  const flavorsById = new Map<string, any>();
  (flavorsResult.data ?? []).forEach((f: any) => flavorsById.set(String(f.id), f));

  const supabaseSession = await createServerComponentClient();
  const {
    data: { session },
  } = await supabaseSession.auth.getSession();

  // Wrapper action to satisfy Next.js/TypeScript form action typing (Promise<void>).
  const handleHumorMixUpdate = async (formData: FormData) => {
    await updateHumorMix(formData);
  };

  return (
    <AdminLayout userEmail={session?.user.email}>
      <div className="mb-8">
        <div className="mb-4">
          <AdminBackButton />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Humor Mix</h1>
        <p className="text-base text-gray-600">
          Adjust the target caption count for each humor flavor. This page is read-only except for updating the caption
          count.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm">
        {error ? (
          <div className="px-6 py-4">
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Error loading humor mix: {error.message}
            </div>
          </div>
        ) : mixResult.data && mixResult.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Humor Flavor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Caption Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mixResult.data.map((row: any) => {
                  const flavor = flavorsById.get(String(row.humor_flavor_id));
                  return (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-semibold">{flavor?.slug ?? `Flavor #${String(row.humor_flavor_id)}`}</div>
                        {flavor?.description && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {flavor.description.length > 80
                              ? `${flavor.description.slice(0, 80)}…`
                              : flavor.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <form action={handleHumorMixUpdate} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={row.id} />
                          <input
                            type="number"
                            name="caption_count"
                            defaultValue={row.caption_count}
                            min={0}
                            className="w-20 rounded-md border-gray-300 text-sm shadow-sm focus:border-green-500 focus:ring-green-500"
                          />
                          <button
                            type="submit"
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                          >
                            Save
                          </button>
                        </form>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(row.created_datetime_utc)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">#{row.id}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8">
            <p className="text-sm text-gray-500 text-center">No humor mix rows found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

