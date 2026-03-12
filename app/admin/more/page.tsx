import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { redirect } from 'next/navigation';

export default async function AdminMorePage() {
  await requireSuperadmin();
  // Backwards-compat route: keep old /admin/more working, but redirect to the new section landing page.
  redirect('/admin/content');
}

