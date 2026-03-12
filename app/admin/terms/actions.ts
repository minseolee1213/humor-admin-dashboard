'use server';

import { revalidatePath } from 'next/cache';
import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';

export async function createTerm(formData: FormData) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const idRaw = (formData.get('id') as string | null)?.trim() ?? '';
  const term = (formData.get('term') as string | null)?.trim() ?? '';
  const definition = (formData.get('definition') as string | null)?.trim() ?? '';
  const example = (formData.get('example') as string | null)?.trim() ?? '';
  const priorityRaw = (formData.get('priority') as string | null)?.trim() ?? '0';
  const termTypeRaw = (formData.get('term_type_id') as string | null)?.trim() ?? '';

  if (!term) return { error: 'Term is required.' };
  if (!definition) return { error: 'Definition is required.' };
  if (!example) return { error: 'Example is required.' };

  const priority = Number.parseInt(priorityRaw, 10);
  if (Number.isNaN(priority) || priority < 0) return { error: 'Priority must be a non-negative integer.' };

  const payload: any = {
    term,
    definition,
    example,
    priority,
    term_type_id: termTypeRaw ? Number.parseInt(termTypeRaw, 10) : null,
  };

  if (termTypeRaw && Number.isNaN(payload.term_type_id)) {
    return { error: 'Invalid term type.' };
  }

  if (idRaw) {
    const id = Number.parseInt(idRaw, 10);
    if (Number.isNaN(id)) return { error: 'ID must be an integer.' };
    payload.id = id;
  }

  const { error } = await supabase.from('terms').insert(payload);
  if (error) return { error: error.message };

  revalidatePath('/admin/terms');
  return { success: true };
}

export async function updateTerm(formData: FormData) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const idRaw = (formData.get('id') as string | null)?.trim() ?? '';
  const term = (formData.get('term') as string | null)?.trim() ?? '';
  const definition = (formData.get('definition') as string | null)?.trim() ?? '';
  const example = (formData.get('example') as string | null)?.trim() ?? '';
  const priorityRaw = (formData.get('priority') as string | null)?.trim() ?? '0';
  const termTypeRaw = (formData.get('term_type_id') as string | null)?.trim() ?? '';

  const id = Number.parseInt(idRaw, 10);
  if (Number.isNaN(id)) return { error: 'Invalid id.' };

  if (!term) return { error: 'Term is required.' };
  if (!definition) return { error: 'Definition is required.' };
  if (!example) return { error: 'Example is required.' };

  const priority = Number.parseInt(priorityRaw, 10);
  if (Number.isNaN(priority) || priority < 0) return { error: 'Priority must be a non-negative integer.' };

  const term_type_id = termTypeRaw ? Number.parseInt(termTypeRaw, 10) : null;
  if (termTypeRaw && Number.isNaN(term_type_id as any)) return { error: 'Invalid term type.' };

  const { error } = await supabase
    .from('terms')
    .update({
      term,
      definition,
      example,
      priority,
      term_type_id,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/terms');
  return { success: true };
}

export async function deleteTerm(id: number) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const { error } = await supabase.from('terms').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/terms');
  return { success: true };
}

