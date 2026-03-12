import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';
import { createServerComponentClient } from '@/lib/supabase/server-component-client';
import AdminLayout from '../admin-layout';
import AdminBackButton from '../admin-back-button';
import AllowedSignupDomainForm, { type AllowedSignupDomain } from './allowed-signup-domain-form';
import AllowedSignupDomainsTable from './allowed-signup-domains-table';

export default async function AdminAllowedSignupDomainsPage() {
  await requireSuperadmin();

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('allowed_signup_domains')
    .select('*')
    .order('created_datetime_utc', { ascending: false });

  const rows: AllowedSignupDomain[] =
    (data ?? []).map((r: any) => ({
      id: r.id,
      created_datetime_utc: r.created_datetime_utc,
      apex_domain: r.apex_domain,
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Allowed Signup Domains</h1>
        <p className="text-base text-gray-600">Manage which email domains are allowed to sign up.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Domain</h2>
        <AllowedSignupDomainForm />
        <p className="mt-2 text-xs text-gray-500">Use apex domains like <span className="font-mono">example.com</span>.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm">
        {error ? (
          <div className="px-6 py-4">
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Error loading allowed signup domains: {error.message}
            </div>
          </div>
        ) : (
          <AllowedSignupDomainsTable rows={rows} />
        )}
      </div>
    </AdminLayout>
  );
}

