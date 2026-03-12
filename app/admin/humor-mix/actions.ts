'use server';

import { revalidatePath } from 'next/cache';
import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';

export async function updateHumorMix(formData: FormData): Promise<void> {
  await requireSuperadmin();
  const supabase = createServerClient();

  const id = formData.get('id') as string;
  const captionCountRaw = formData.get('caption_count') as string;

  const parsed = Number.parseInt(captionCountRaw, 10);
  const caption_count = Number.isNaN(parsed) ? null : parsed;

  if (caption_count === null || caption_count < 0) {
    throw new Error('Caption count must be a non-negative integer.');
  }

  const { error } = await supabase
    .from('humor_flavor_mix')
    .update({ caption_count })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin/humor-mix');
}

