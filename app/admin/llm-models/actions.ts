'use server';

import { revalidatePath } from 'next/cache';
import { requireSuperadmin } from '@/lib/auth/require-superadmin';
import { createServerClient } from '@/lib/supabase/server-client';

export async function createLlmModel(formData: FormData) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const idRaw = (formData.get('id') as string | null)?.trim() ?? '';
  const name = (formData.get('name') as string | null)?.trim() ?? '';
  const providerModelId = (formData.get('provider_model_id') as string | null)?.trim() ?? '';
  const providerIdRaw = (formData.get('llm_provider_id') as string | null)?.trim() ?? '';
  const isTempSupported = formData.get('is_temperature_supported') === 'true';

  const id = Number.parseInt(idRaw, 10);
  const llm_provider_id = Number.parseInt(providerIdRaw, 10);

  if (Number.isNaN(id)) return { error: 'Model ID is required and must be an integer.' };
  if (!name) return { error: 'Model name is required.' };
  if (!providerModelId) return { error: 'Provider model id is required.' };
  if (Number.isNaN(llm_provider_id)) return { error: 'Provider is required.' };

  const { error } = await supabase.from('llm_models').insert({
    id,
    name,
    provider_model_id: providerModelId,
    llm_provider_id,
    is_temperature_supported: isTempSupported,
  });
  if (error) return { error: error.message };

  revalidatePath('/admin/llm-models');
  return { success: true };
}

export async function updateLlmModel(formData: FormData) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const idRaw = (formData.get('id') as string | null)?.trim() ?? '';
  const name = (formData.get('name') as string | null)?.trim() ?? '';
  const providerModelId = (formData.get('provider_model_id') as string | null)?.trim() ?? '';
  const providerIdRaw = (formData.get('llm_provider_id') as string | null)?.trim() ?? '';
  const isTempSupported = formData.get('is_temperature_supported') === 'true';

  const id = Number.parseInt(idRaw, 10);
  const llm_provider_id = Number.parseInt(providerIdRaw, 10);

  if (Number.isNaN(id)) return { error: 'Invalid model id.' };
  if (!name) return { error: 'Model name is required.' };
  if (!providerModelId) return { error: 'Provider model id is required.' };
  if (Number.isNaN(llm_provider_id)) return { error: 'Provider is required.' };

  const { error } = await supabase
    .from('llm_models')
    .update({
      name,
      provider_model_id: providerModelId,
      llm_provider_id,
      is_temperature_supported: isTempSupported,
    })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/llm-models');
  return { success: true };
}

export async function deleteLlmModel(id: number) {
  await requireSuperadmin();
  const supabase = createServerClient();

  const { error } = await supabase.from('llm_models').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/llm-models');
  return { success: true };
}

