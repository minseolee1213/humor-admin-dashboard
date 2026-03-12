import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';
import { createServerComponentClient } from '@/lib/supabase/server-component-client';
import AdminLayout from '../admin-layout';
import AdminBackButton from '../admin-back-button';
import WhitelistedEmailsTable from './whitelisted-emails-table';
import { createWhitelistedEmail } from './actions';

export interface WhitelistedEmail {
  id: number;
  created_datetime_utc: string;
  modified_datetime_utc: string | null;
  email_address: string;
}

export default async function AdminWhitelistedEmailsPage() {
  await requireSuperadmin();

  const supabase = createServerClient();
  const { data: emails, error } = await supabase
    .from('whitelist_email_addresses')
    .select('*')
    .order('created_datetime_utc', { ascending: false });

  // Wrapper action so the form action type matches `Promise<void>`.
  const handleCreateWhitelistedEmail = async (formData: FormData) => {
    await createWhitelistedEmail(formData);
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Whitelisted Emails</h1>
        <p className="text-base text-gray-600">
          Manage email addresses that are explicitly allowed to access the system.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Email</h2>
        <form action={handleCreateWhitelistedEmail} className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="email_address">
              Email address
            </label>
            <input
              id="email_address"
              name="email_address"
              type="email"
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
              placeholder="name@example.com"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
          >
            Add
          </button>
        </form>
        <p className="mt-2 text-xs text-gray-500">
          Email format is validated. Addresses must be unique according to your database constraints.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm">
        {error ? (
          <div className="px-6 py-4">
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Error loading whitelisted emails: {error.message}
            </div>
          </div>
        ) : (
          <WhitelistedEmailsTable emails={(emails ?? []).map((e: any) => ({
            id: e.id,
            created_datetime_utc: e.created_datetime_utc,
            modified_datetime_utc: e.modified_datetime_utc,
            email_address: e.email_address,
          }))} />
        )}
      </div>
    </AdminLayout>
  );
}

