'use server';

import { revalidatePath } from 'next/cache';
import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';

export async function createCaptionExample(formData: FormData) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const idRaw = (formData.get('id') as string | null)?.trim() ?? '';
  const imageDescription = (formData.get('image_description') as string | null)?.trim() ?? '';
  const caption = (formData.get('caption') as string | null)?.trim() ?? '';
  const explanation = (formData.get('explanation') as string | null)?.trim() ?? '';
  const priorityRaw = (formData.get('priority') as string | null)?.trim() ?? '0';
  const imageIdRaw = (formData.get('image_id') as string | null)?.trim() ?? '';

  if (!imageDescription) return { error: 'Image description is required.' };
  if (!caption) return { error: 'Caption is required.' };
  if (!explanation) return { error: 'Explanation is required.' };

  const priority = Number.parseInt(priorityRaw, 10);
  if (Number.isNaN(priority) || priority < 0) return { error: 'Priority must be a non-negative integer.' };

  const payload: any = {
    image_description: imageDescription,
    caption,
    explanation,
    priority,
    image_id: imageIdRaw ? imageIdRaw : null,
  };

  if (idRaw) {
    const id = Number.parseInt(idRaw, 10);
    if (Number.isNaN(id)) return { error: 'ID must be an integer.' };
    payload.id = id;
  }

  const { error } = await supabase.from('caption_examples').insert(payload);
  if (error) return { error: error.message };

  revalidatePath('/admin/caption-examples');
  return { success: true };
}

export async function updateCaptionExample(formData: FormData) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const idRaw = (formData.get('id') as string | null)?.trim() ?? '';
  const id = Number.parseInt(idRaw, 10);
  if (Number.isNaN(id)) return { error: 'Invalid id.' };

  const imageDescription = (formData.get('image_description') as string | null)?.trim() ?? '';
  const caption = (formData.get('caption') as string | null)?.trim() ?? '';
  const explanation = (formData.get('explanation') as string | null)?.trim() ?? '';
  const priorityRaw = (formData.get('priority') as string | null)?.trim() ?? '0';
  const imageIdRaw = (formData.get('image_id') as string | null)?.trim() ?? '';

  if (!imageDescription) return { error: 'Image description is required.' };
  if (!caption) return { error: 'Caption is required.' };
  if (!explanation) return { error: 'Explanation is required.' };

  const priority = Number.parseInt(priorityRaw, 10);
  if (Number.isNaN(priority) || priority < 0) return { error: 'Priority must be a non-negative integer.' };

  const { error } = await supabase
    .from('caption_examples')
    .update({
      image_description: imageDescription,
      caption,
      explanation,
      priority,
      image_id: imageIdRaw ? imageIdRaw : null,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/caption-examples');
  return { success: true };
}

export async function deleteCaptionExample(id: number) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const { error } = await supabase.from('caption_examples').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/caption-examples');
  return { success: true };
}

