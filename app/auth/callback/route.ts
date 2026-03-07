import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/route-handler-client';
import { createServerClient } from '@/lib/supabase/server-client';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createRouteHandlerClient();
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);
    
    // After successful login, check if user is superadmin
    if (session?.user) {
      const adminSupabase = createServerClient();
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('is_superadmin')
        .eq('id', session.user.id)
        .single();

      if (profile?.is_superadmin) {
        // User is superadmin - redirect to admin dashboard
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
  }

  // Not superadmin or no session - redirect to home page
  // Home page will show appropriate message
  return NextResponse.redirect(new URL('/', request.url));
}
