import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase/server-component-client';
import { createServerClient } from '@/lib/supabase/server-client';
import SignOutButton from './components/sign-out-button';

export default async function HomePage() {
  const supabase = await createServerComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    // Check if user is a superadmin before redirecting to /admin
    const adminSupabase = createServerClient();
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', session.user.id)
      .single();

    if (profile?.is_superadmin) {
      redirect('/admin');
    } else {
      // User is logged in but not a superadmin - show message
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4">
          <div className="max-w-md w-full">
            {/* Logo and Branding */}
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-700 text-white text-lg font-semibold">
                  HA
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500 font-medium">HUMOR PROJECT</p>
                  <p className="text-xl font-bold text-gray-900">Admin</p>
                </div>
              </div>
            </div>

            {/* Access Restricted Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Access Restricted
                </h1>
                <p className="text-sm text-gray-600">
                  You are logged in as: <span className="font-medium text-gray-900">{session.user.email}</span>
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200/60 rounded-xl px-4 py-3 mb-6">
                <p className="text-sm font-medium text-yellow-800 mb-1">Admin access required</p>
                <p className="text-xs text-yellow-700">
                  You need superadmin privileges to access the admin dashboard.
                </p>
              </div>

              <div className="space-y-4">
                <SignOutButton />
                <p className="text-xs text-center text-gray-500">
                  Contact an administrator to request superadmin access.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  redirect('/login');
}
