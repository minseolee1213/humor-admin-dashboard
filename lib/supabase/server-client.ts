import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!serviceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

/**
 * Server-only Supabase client using the service role key.
 *
 * IMPORTANT:
 * - This module imports `server-only`, so it must NEVER be imported from client components or the browser.
 * - Use it only in server components, route handlers, and server actions.
 */
export function createServerClient(): SupabaseClient {
  // TypeScript assertion: we've already checked these are defined above
  return createClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      persistSession: false,
    },
  });
}

