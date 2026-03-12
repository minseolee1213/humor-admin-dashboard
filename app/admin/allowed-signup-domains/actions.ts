'use server';

import { revalidatePath } from 'next/cache';
import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';

function isValidApexDomain(domain: string): boolean {
  const d = domain.trim().toLowerCase();
  if (!d) return false;
  if (d.includes('://')) return false;
  if (d.includes('/')) return false;
  if (d.includes('@')) return false;
  // very simple apex domain check: "example.com"
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(d);
}

export async function createAllowedSignupDomain(formData: FormData) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const idRaw = (formData.get('id') as string | null)?.trim() ?? '';
  const apexDomainRaw = (formData.get('apex_domain') as string | null)?.trim() ?? '';
  const apex_domain = apexDomainRaw.toLowerCase();

  if (!isValidApexDomain(apex_domain)) {
    return { error: 'Please enter a valid apex domain (e.g. example.com).' };
  }

  const payload: { apex_domain: string; id?: number } = { apex_domain };
  if (idRaw) {
    const id = Number.parseInt(idRaw, 10);
    if (Number.isNaN(id)) return { error: 'ID must be an integer.' };
    payload.id = id;
  }

  const { error } = await supabase.from('allowed_signup_domains').insert(payload);
  if (error) return { error: error.message };

  revalidatePath('/admin/allowed-signup-domains');
  return { success: true };
}

export async function updateAllowedSignupDomain(formData: FormData) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const idRaw = (formData.get('id') as string | null)?.trim() ?? '';
  const apexDomainRaw = (formData.get('apex_domain') as string | null)?.trim() ?? '';
  const apex_domain = apexDomainRaw.toLowerCase();

  const id = Number.parseInt(idRaw, 10);
  if (Number.isNaN(id)) return { error: 'Invalid id.' };

  if (!isValidApexDomain(apex_domain)) {
    return { error: 'Please enter a valid apex domain (e.g. example.com).' };
  }

  const { error } = await supabase.from('allowed_signup_domains').update({ apex_domain }).eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/allowed-signup-domains');
  return { success: true };
}

export async function deleteAllowedSignupDomain(id: number) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const { error } = await supabase.from('allowed_signup_domains').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/allowed-signup-domains');
  return { success: true };
}

