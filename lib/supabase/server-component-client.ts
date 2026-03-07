import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for use in server components.
 * This client reads cookies to get the user session.
 * 
 * Note: Server components are read-only, so setAll is a no-op.
 * Cookies can only be modified in route handlers or server actions.
 */
export async function createServerComponentClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Server components are read-only - cookies cannot be modified here
          // Cookies are only modified in route handlers or server actions
          // This is intentional and safe to ignore
        },
      },
    }
  );
}
