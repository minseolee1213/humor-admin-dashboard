'use server';

import { revalidatePath } from 'next/cache';
import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';

const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

async function uploadImageFileIfProvided(formData: FormData): Promise<{ publicUrl?: string; error?: string }> {
  const file = formData.get('image_file');
  if (!(file instanceof File) || file.size === 0) {
    return {};
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return { error: 'Image file must be 10MB or smaller.' };
  }

  const bucketName = process.env.SUPABASE_IMAGE_BUCKET;
  if (!bucketName) {
    return {
      error:
        'Image upload is not configured. Set SUPABASE_IMAGE_BUCKET in your environment, or provide an image URL.',
    };
  }

  const supabase = createServerClient();
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  const safeExt = (ext ?? 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `admin-uploads/${crypto.randomUUID()}.${safeExt || 'bin'}`;

  const { error: uploadError } = await supabase.storage.from(bucketName).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });

  if (uploadError) {
    return { error: `Image upload failed: ${uploadError.message}` };
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  if (!data?.publicUrl) {
    return { error: 'Image upload succeeded but public URL could not be generated.' };
  }

  return { publicUrl: data.publicUrl };
}

export async function createImage(formData: FormData) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const uploadResult = await uploadImageFileIfProvided(formData);
  if (uploadResult.error) {
    return { error: uploadResult.error };
  }

  const urlFromInput = (formData.get('url') as string | null)?.trim() ?? '';
  const url = uploadResult.publicUrl ?? urlFromInput;
  const additionalContext = formData.get('additional_context') as string | null;
  const isPublic = formData.get('is_public') === 'true';
  const isCommonUse = formData.get('is_common_use') === 'true';
  const imageDescription = formData.get('image_description') as string | null;
  const celebrityRecognition = formData.get('celebrity_recognition') as string | null;
  const profileId = formData.get('profile_id') as string | null;

  if (!url) {
    return { error: 'Provide either an image URL or upload an image file.' };
  }

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

  const uploadResult = await uploadImageFileIfProvided(formData);
  if (uploadResult.error) {
    return { error: uploadResult.error };
  }

  const id = formData.get('id') as string;
  const urlFromInput = (formData.get('url') as string | null)?.trim() ?? '';
  const url = uploadResult.publicUrl ?? urlFromInput;
  const additionalContext = formData.get('additional_context') as string | null;
  const isPublic = formData.get('is_public') === 'true';
  const isCommonUse = formData.get('is_common_use') === 'true';
  const imageDescription = formData.get('image_description') as string | null;
  const celebrityRecognition = formData.get('celebrity_recognition') as string | null;
  const profileId = formData.get('profile_id') as string | null;

  if (!url) {
    return { error: 'Provide either an image URL or upload an image file.' };
  }

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
