import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';
import { createServerComponentClient } from '@/lib/supabase/server-component-client';
import AdminLayout from '../admin-layout';
import ImagesTable from './images-table';
import ImageForm from './image-form';

export default async function AdminImagesPage() {
  await requireSuperadmin();

  const supabase = createServerClient();
  const { data: images, error } = await supabase
    .from('images')
    .select('*')
    .order('created_datetime_utc', { ascending: false });

  // Get user session for display
  const supabaseSession = await createServerComponentClient();
  const {
    data: { session },
  } = await supabaseSession.auth.getSession();

  return (
    <AdminLayout userEmail={session?.user.email}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Images</h1>
        <p className="text-base text-gray-600">
          Create, view, update, and delete images
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-7 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Image</h2>
        <ImageForm />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm">
        {error ? (
          <div className="px-6 py-4">
            <p className="text-sm text-red-600">Error loading images: {error.message}</p>
          </div>
        ) : (
          <ImagesTable images={images || []} />
        )}
      </div>
    </AdminLayout>
  );
}
