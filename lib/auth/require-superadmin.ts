import 'server-only';

import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/lib/supabase/server-component-client';
import { createServerClient } from '@/lib/supabase/server-client';

/**
 * Server-side helper to require superadmin access.
 *
 * Checks:
 * 1. User is authenticated (has a valid session)
 * 2. User has a profile row in the profiles table
 * 3. User's profile has is_superadmin == true
 *
 * Redirects:
 * - If not logged in → /login
 * - If logged in but not superadmin → /
 *
 * @returns The authenticated user's ID if checks pass
 * @throws Redirects if checks fail
 */
export async function requireSuperadmin(): Promise<string> {
  // Step 1: Check if user is authenticated
  const supabase = await createServerComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || !session.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  // Step 2: Query profiles table using service role key (bypasses RLS)
  // This is safe because:
  // - We're server-side only (imports 'server-only')
  // - We're only reading, not modifying data
  // - We need to check admin status regardless of RLS policies
  const adminSupabase = createServerClient();
  const { data: profile, error } = await adminSupabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', userId)
    .single();

  // Step 3: Handle cases where profile doesn't exist or query fails
  // Safest approach: treat missing profile as not being a superadmin
  // This prevents unauthorized access if a profile hasn't been created yet
  if (error || !profile) {
    // Profile doesn't exist or query failed - redirect to home
    // This is safer than allowing access when profile is missing
    redirect('/');
  }

  // Step 4: Check if user is superadmin
  if (!profile.is_superadmin) {
    redirect('/');
  }

  return userId;
}
