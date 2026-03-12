'use server';

import { revalidatePath } from 'next/cache';
import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';

function isValidEmail(email: string): boolean {
  // Simple but reasonable email check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createWhitelistedEmail(formData: FormData): Promise<void> {
  await requireSuperadmin();
  const supabase = createServerClient();

  const email = (formData.get('email_address') as string | null)?.trim() ?? '';

  if (!isValidEmail(email)) {
    throw new Error('Please enter a valid email address.');
  }

  const { error } = await supabase.from('whitelist_email_addresses').insert({
    email_address: email,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/whitelisted-emails');
}

export async function updateWhitelistedEmail(formData: FormData) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const id = formData.get('id') as string;
  const email = (formData.get('email_address') as string | null)?.trim() ?? '';

  if (!isValidEmail(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  const { error } = await supabase
    .from('whitelist_email_addresses')
    .update({ email_address: email, modified_datetime_utc: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/whitelisted-emails');
  return { success: true };
}

export async function deleteWhitelistedEmail(id: number) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const { error } = await supabase.from('whitelist_email_addresses').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/whitelisted-emails');
  return { success: true };
}

