import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

/**
 * Browser Supabase client using the public anon key.
 *
 * Safe to use in client-side code.
 * Uses @supabase/ssr for proper cookie handling in Next.js.
 */
export function createBrowserClient(): SupabaseClient {
  // TypeScript assertion: we've already checked these are defined above
  return createSupabaseBrowserClient(supabaseUrl!, supabaseAnonKey!);
}

