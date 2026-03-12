'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createLlmModel, updateLlmModel } from './actions';

export interface LlmProviderOption {
  id: number;
  name: string;
}

export interface LlmModel {
  id: number;
  created_datetime_utc: string;
  name: string;
  llm_provider_id: number;
  provider_model_id: string;
  is_temperature_supported: boolean;
}

interface Props {
  model?: LlmModel;
  providers: LlmProviderOption[];
  onSuccess?: () => void;
}

export default function LlmModelForm({ model, providers, onSuccess }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [id, setId] = useState(model ? String(model.id) : '');
  const [name, setName] = useState(model?.name ?? '');
  const [providerModelId, setProviderModelId] = useState(model?.provider_model_id ?? '');
  const [providerId, setProviderId] = useState(model ? String(model.llm_provider_id) : (providers[0] ? String(providers[0].id) : ''));
  const [tempSupported, setTempSupported] = useState(model?.is_temperature_supported ?? false);

  const providerLabel = useMemo(() => {
    const match = providers.find((p) => p.id === Number.parseInt(providerId, 10));
    return match?.name ?? '';
  }, [providerId, providers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const fd = new FormData();
      fd.append('id', id);
      fd.append('name', name);
      fd.append('provider_model_id', providerModelId);
      fd.append('llm_provider_id', providerId);
      fd.append('is_temperature_supported', tempSupported.toString());

      const result = model ? await updateLlmModel(fd) : await createLlmModel(fd);
      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(model ? 'Model updated.' : 'Model created.');
      if (!model) {
        setId('');
        setName('');
        setProviderModelId('');
        setProviderId(providers[0] ? String(providers[0].id) : '');
        setTempSupported(false);
      }
      onSuccess?.();
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="model_id">
            Model ID <span className="text-red-600">*</span>
          </label>
          <input
            id="model_id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            disabled={!!model}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm disabled:bg-gray-50"
            placeholder="e.g. 1"
          />
          {model ? <p className="mt-1 text-xs text-gray-500">ID cannot be changed.</p> : null}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="model_name">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            id="model_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
            placeholder="e.g. GPT-4.1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="provider_id">
            Provider <span className="text-red-600">*</span>
          </label>
          <select
            id="provider_id"
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (#{p.id})
              </option>
            ))}
          </select>
          {providerLabel ? <p className="mt-1 text-xs text-gray-500">Selected: {providerLabel}</p> : null}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="provider_model_id">
            Provider model id <span className="text-red-600">*</span>
          </label>
          <input
            id="provider_model_id"
            value={providerModelId}
            onChange={(e) => setProviderModelId(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
            placeholder="e.g. gpt-4.1-mini"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="temp_supported"
          type="checkbox"
          checked={tempSupported}
          onChange={(e) => setTempSupported(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <label htmlFor="temp_supported" className="ml-2 block text-sm text-gray-900">
          Temperature supported
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : model ? 'Save changes' : 'Create model'}
        </button>
      </div>
    </form>
  );
}

