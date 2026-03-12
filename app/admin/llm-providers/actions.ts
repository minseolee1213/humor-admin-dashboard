'use server';

import { revalidatePath } from 'next/cache';
import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';

export async function createLlmProvider(formData: FormData) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const idRaw = (formData.get('id') as string | null)?.trim() ?? '';
  const name = (formData.get('name') as string | null)?.trim() ?? '';

  if (!idRaw) return { error: 'Provider ID is required.' };
  const id = Number.parseInt(idRaw, 10);
  if (Number.isNaN(id)) return { error: 'Provider ID must be an integer.' };
  if (!name) return { error: 'Provider name is required.' };

  const { error } = await supabase.from('llm_providers').insert({ id, name });
  if (error) return { error: error.message };

  revalidatePath('/admin/llm-providers');
  return { success: true };
}

export async function updateLlmProvider(formData: FormData) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const idRaw = (formData.get('id') as string | null)?.trim() ?? '';
  const name = (formData.get('name') as string | null)?.trim() ?? '';

  const id = Number.parseInt(idRaw, 10);
  if (Number.isNaN(id)) return { error: 'Invalid provider id.' };
  if (!name) return { error: 'Provider name is required.' };

  const { error } = await supabase.from('llm_providers').update({ name }).eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/llm-providers');
  return { success: true };
}

export async function deleteLlmProvider(id: number) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const { error } = await supabase.from('llm_providers').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/llm-providers');
  return { success: true };
}

