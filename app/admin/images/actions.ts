'use server';

import { revalidatePath } from 'next/cache';
import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';

export async function createImage(formData: FormData) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const url = formData.get('url') as string;
  const additionalContext = formData.get('additional_context') as string | null;
  const isPublic = formData.get('is_public') === 'true';
  const isCommonUse = formData.get('is_common_use') === 'true';
  const imageDescription = formData.get('image_description') as string | null;
  const celebrityRecognition = formData.get('celebrity_recognition') as string | null;
  const profileId = formData.get('profile_id') as string | null;

  const { error } = await supabase.from('images').insert({
    url,
    additional_context: additionalContext || null,
    is_public: isPublic,
    is_common_use: isCommonUse,
    image_description: imageDescription || null,
    celebrity_recognition: celebrityRecognition || null,
    profile_id: profileId || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/images');
  return { success: true };
}

export async function updateImage(formData: FormData) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const id = formData.get('id') as string;
  const url = formData.get('url') as string;
  const additionalContext = formData.get('additional_context') as string | null;
  const isPublic = formData.get('is_public') === 'true';
  const isCommonUse = formData.get('is_common_use') === 'true';
  const imageDescription = formData.get('image_description') as string | null;
  const celebrityRecognition = formData.get('celebrity_recognition') as string | null;
  const profileId = formData.get('profile_id') as string | null;

  const { error } = await supabase
    .from('images')
    .update({
      url,
      additional_context: additionalContext || null,
      is_public: isPublic,
      is_common_use: isCommonUse,
      image_description: imageDescription || null,
      celebrity_recognition: celebrityRecognition || null,
      profile_id: profileId || null,
    })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/images');
  return { success: true };
}

export async function deleteImage(id: string) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const { error } = await supabase.from('images').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin/images');
  return { success: true };
}
