import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';
import { createServerComponentClient } from '@/lib/supabase/server-component-client';
import AdminLayout from '../admin-layout';
import UsersTable from './users-table';

export default async function AdminUsersPage() {
  await requireSuperadmin();

  const supabase = createServerClient();
  const { data: profiles, error } = await supabase
    .from('profiles')
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
        <p className="text-base text-gray-600">
          Manage user profiles and permissions
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm">
        {error ? (
          <div className="px-6 py-4">
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Error loading profiles: {error.message}
            </div>
          </div>
        ) : (
          <UsersTable profiles={profiles || []} />
        )}
      </div>
    </AdminLayout>
  );
}
