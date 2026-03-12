import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';
import { createServerComponentClient } from '@/lib/supabase/server-component-client';
import AdminLayout from '../admin-layout';
import AdminBackButton from '../admin-back-button';

import CaptionExampleForm, { type CaptionExampleRow, type ImageOption } from './caption-example-form';
import CaptionExamplesTable from './caption-examples-table';

export default async function AdminCaptionExamplesPage() {
  await requireSuperadmin();

  const supabase = createServerClient();
  const [examplesResult, imagesResult] = await Promise.all([
    supabase.from('caption_examples').select('*').order('created_datetime_utc', { ascending: false }),
    supabase.from('images').select('id,url,image_description').order('created_datetime_utc', { ascending: false }).limit(200),
  ]);

  const error = examplesResult.error || imagesResult.error;

  const images: ImageOption[] =
    (imagesResult.data ?? []).map((img: any) => ({
      id: img.id,
      url: img.url ?? null,
      image_description: img.image_description ?? null,
    })) ?? [];

  const rows: CaptionExampleRow[] =
    (examplesResult.data ?? []).map((r: any) => ({
      id: r.id,
      created_datetime_utc: r.created_datetime_utc,
      modified_datetime_utc: r.modified_datetime_utc,
      image_description: r.image_description,
      caption: r.caption,
      explanation: r.explanation,
      priority: r.priority,
      image_id: r.image_id ?? null,
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Caption Examples</h1>
        <p className="text-base text-gray-600">Create, update, and delete caption examples.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Caption Example</h2>
        <CaptionExampleForm images={images} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm">
        {error ? (
          <div className="px-6 py-4">
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Error loading caption examples: {error.message}
            </div>
          </div>
        ) : (
          <CaptionExamplesTable rows={rows} images={images} />
        )}
      </div>
    </AdminLayout>
  );
}

